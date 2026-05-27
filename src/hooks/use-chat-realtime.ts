import { useEffect } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { chatApi } from "@/services/chat.api";
import { getUserIdFromAccessToken } from "@/shared/lib/jwt-claims";
import { useAppDispatch } from "@/app/store/store.types";

const PRESENCE_HEARTBEAT_MS = 60_000;

export function useChatRealtime() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromAccessToken(token);
    const apiUrl = (import.meta.env.VITE_API_URL as string | undefined)
      ?.replace(/\/$/, "")
      .replace(/\/api$/i, "");
    if (!token || !userId || !apiUrl) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/chatHub`, {
        accessTokenFactory: () => localStorage.getItem("token") ?? ""
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    const invalidateDialogs = () => {
      dispatch(
        chatApi.util.invalidateTags([{ type: "ChatDialogs", id: "LIST" }])
      );
    };

    connection.on("ReceiveMessage", () => {
      dispatch(
        chatApi.util.invalidateTags([
          { type: "ChatDialogs", id: "LIST" },
          { type: "ChatMessages", id: "LIST" }
        ])
      );
    });

    connection.on("UserPresenceChanged", () => {
      invalidateDialogs();
      dispatch(chatApi.util.invalidateTags([{ type: "ChatUserPresence" }]));
    });

    connection.start().catch(() => undefined);

    const touchPresence = () => {
      dispatch(chatApi.endpoints.touchPresence.initiate());
    };

    touchPresence();
    const heartbeatId = window.setInterval(
      touchPresence,
      PRESENCE_HEARTBEAT_MS
    );

    return () => {
      window.clearInterval(heartbeatId);
      connection.off("ReceiveMessage");
      connection.off("UserPresenceChanged");
      void connection.stop();
    };
  }, [dispatch]);
}
