"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { applyMove, createInitialGameState, selectPiece } from "@/lib/checkers/engine";
import type { GameState, PieceColor, Position } from "@/lib/types";

export type RoomStatus = "loading" | "waiting" | "playing" | "finished" | "error";

export interface RoomInfo {
  code: string;
  hostId: string;
  guestId: string | null;
  hostUsername: string;
  guestUsername: string;
  status: "waiting" | "playing" | "finished";
  hostColor: PieceColor;
  winner: "host" | "guest" | "draw" | null;
}

// Reconstruct a GameState from the JSON stored in Supabase
function fromServer(bs: Record<string, unknown>): GameState {
  return {
    board: bs.board as GameState["board"],
    currentTurn: (bs.currentTurn as PieceColor) ?? "black",
    status: (bs.status as GameState["status"]) ?? "playing",
    capturedPieces: (bs.capturedPieces as GameState["capturedPieces"]) ?? { red: 0, black: 0 },
    moveHistory: (bs.moveHistory as GameState["moveHistory"]) ?? [],
    selectedPiece: null,
    validMoves: [],
    mustCapture: false,
    chainCapture: null,
  };
}

export function useRoom(code: string, userId: string, username: string) {
  const supabase = createClient();
  const isMounted = useRef(true);

  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [myColor, setMyColor] = useState<PieceColor | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("loading");
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMyTurn =
    myColor !== null &&
    gameState.currentTurn === myColor &&
    roomStatus === "playing" &&
    gameState.status === "playing";

  useEffect(() => {
    isMounted.current = true;

    const init = async () => {
      const { data: room, error: fetchErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .single();

      if (!isMounted.current) return;

      if (fetchErr || !room) {
        setError("Room not found. Check the code and try again.");
        setRoomStatus("error");
        return;
      }

      const isHost = room.host_id === userId;
      const isGuest = room.guest_id === userId;

      // Assign colors: host = black (moves first), guest = red
      const hostColor: PieceColor = "black";
      const guestColor: PieceColor = "red";
      const myCol: PieceColor = isHost ? hostColor : guestColor;

      if (!isHost && !isGuest) {
        // New guest joining — update room and start game
        if (room.status !== "waiting") {
          setError("This room is already in progress or full.");
          setRoomStatus("error");
          return;
        }

        const initial = createInitialGameState();
        const { error: joinErr } = await supabase
          .from("rooms")
          .update({
            guest_id: userId,
            guest_username: username,
            status: "playing",
            host_color: hostColor,
            board_state: {
              board: initial.board,
              currentTurn: "black",
              status: "playing",
              capturedPieces: { red: 0, black: 0 },
              moveHistory: [],
            },
          })
          .eq("code", code);

        if (joinErr) {
          setError("Failed to join room.");
          setRoomStatus("error");
          return;
        }

        if (isMounted.current) {
          setMyColor(myCol);
          setGameState(initial);
          setRoomStatus("playing");
          setRoomInfo({
            code: room.code,
            hostId: room.host_id,
            guestId: userId,
            hostUsername: room.host_username ?? "Host",
            guestUsername: username,
            status: "playing",
            hostColor,
            winner: null,
          });
        }
        return;
      }

      // Existing host or returning guest
      if (isMounted.current) {
        setMyColor(myCol);

        if (room.board_state?.board) {
          setGameState(fromServer(room.board_state));
        }

        const rs: RoomStatus =
          room.status === "finished" ? "finished"
          : room.status === "playing" ? "playing"
          : "waiting";
        setRoomStatus(rs);

        setRoomInfo({
          code: room.code,
          hostId: room.host_id,
          guestId: room.guest_id ?? null,
          hostUsername: room.host_username ?? "Host",
          guestUsername: room.guest_username ?? "Guest",
          status: room.status,
          hostColor,
          winner: room.winner ?? null,
        });
      }
    };

    init();

    // Real-time subscription — fires whenever the room row changes
    const channel = supabase
      .channel(`room:${code}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `code=eq.${code}` },
        (payload) => {
          if (!isMounted.current) return;
          const room = payload.new as Record<string, unknown>;

          // Update board when opponent moves
          if (room.board_state && (room.board_state as Record<string, unknown>).board) {
            setGameState(fromServer(room.board_state as Record<string, unknown>));
          }

          // Update status
          const newStatus = room.status as "waiting" | "playing" | "finished";
          setRoomStatus(
            newStatus === "finished" ? "finished"
            : newStatus === "playing" ? "playing"
            : "waiting"
          );

          // Update roomInfo (guest joined, winner set, etc.)
          setRoomInfo((prev) =>
            prev ? {
              ...prev,
              guestId: (room.guest_id as string) ?? prev.guestId,
              guestUsername: (room.guest_username as string) || prev.guestUsername,
              status: newStatus,
              winner: (room.winner as RoomInfo["winner"]) ?? null,
            } : prev
          );
        }
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      channel.unsubscribe();
    };
  }, [code, userId, username]);

  const handleCellClick = useCallback(
    async (pos: Position) => {
      if (!isMyTurn) return;

      // Try to apply a queued move
      const existingMove = gameState.validMoves.find(
        (m) => m.to.row === pos.row && m.to.col === pos.col
      );

      if (existingMove && gameState.selectedPiece) {
        const newState = applyMove(gameState, existingMove);
        setGameState(newState); // optimistic update

        const isOver = newState.status !== "playing";
        const winner = isOver
          ? newState.status === "black_wins" ? "host" : "guest"
          : null;

        await supabase
          .from("rooms")
          .update({
            board_state: {
              board: newState.board,
              currentTurn: newState.currentTurn,
              status: newState.status,
              capturedPieces: newState.capturedPieces,
              moveHistory: newState.moveHistory,
            },
            status: isOver ? "finished" : "playing",
            ...(winner ? { winner } : {}),
          })
          .eq("code", code);

        return;
      }

      // Select / deselect piece
      const piece = gameState.board[pos.row][pos.col];
      if (piece && piece.color === myColor) {
        setGameState((prev) => selectPiece(prev, pos));
      } else {
        setGameState((prev) => ({ ...prev, selectedPiece: null, validMoves: [] }));
      }
    },
    [gameState, isMyTurn, myColor, code, supabase]
  );

  return { gameState, roomInfo, roomStatus, myColor, isMyTurn, error, handleCellClick };
}
