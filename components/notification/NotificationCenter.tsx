"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, Check, Trash2, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "APPLICATION" | "INTERNSHIP" | "SYSTEM";
  read: boolean;
  createdAt: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setNotifications(result.data.notifications || []);
          setUnreadCount(result.data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up polling every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Helper to categorize dates
  const getGroupedNotifications = () => {
    const today: NotificationItem[] = [];
    const yesterday: NotificationItem[] = [];
    const older: NotificationItem[] = [];

    const now = new Date();
    const todayStr = now.toDateString();
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    notifications.forEach((item) => {
      const date = new Date(item.createdAt);
      const itemDateStr = date.toDateString();

      if (itemDateStr === todayStr) {
        today.push(item);
      } else if (itemDateStr === yesterdayStr) {
        yesterday.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = getGroupedNotifications();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted/80 transition-all focus:outline-hidden",
          isOpen && "bg-muted text-primary"
        )}
        aria-label="Toggle notifications menu"
      >
        <Bell className="w-5 h-5 transition-transform active:scale-95" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 md:w-96 rounded-2xl border bg-card text-card-foreground shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/10">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 h-8 px-2.5"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-border/40">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2">
                <div className="p-3 bg-muted/40 rounded-full">
                  <Bell className="w-6 h-6 text-muted-foreground/60" />
                </div>
                <p className="font-semibold text-sm">All caught up!</p>
                <p className="text-xs max-w-[200px]">You will see notifications here when important events happen.</p>
              </div>
            ) : (
              <>
                {today.length > 0 && (
                  <div className="p-3 bg-muted/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">Today</span>
                    <div className="mt-1 space-y-1">
                      {today.map((item) => (
                        <NotificationRow key={item.id} item={item} onMark={handleMarkAsRead} />
                      ))}
                    </div>
                  </div>
                )}
                {yesterday.length > 0 && (
                  <div className="p-3 bg-muted/10 border-t border-border/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">Yesterday</span>
                    <div className="mt-1 space-y-1">
                      {yesterday.map((item) => (
                        <NotificationRow key={item.id} item={item} onMark={handleMarkAsRead} />
                      ))}
                    </div>
                  </div>
                )}
                {older.length > 0 && (
                  <div className="p-3 bg-muted/10 border-t border-border/40">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">Older</span>
                    <div className="mt-1 space-y-1">
                      {older.map((item) => (
                        <NotificationRow key={item.id} item={item} onMark={handleMarkAsRead} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  item,
  onMark,
}: {
  item: NotificationItem;
  onMark: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-2.5 rounded-xl transition-colors hover:bg-muted/60 text-left border border-transparent",
        !item.read && "bg-primary/5 hover:bg-primary/10 border-primary/10"
      )}
    >
      {/* Unread indicator */}
      {!item.read && (
        <span className="absolute top-3.5 left-2 h-1.5 w-1.5 rounded-full bg-primary" />
      )}

      <div className={cn("grow pl-2", !item.read && "pl-2")}>
        <div className="flex items-start justify-between gap-1">
          <span className={cn("text-sm font-semibold tracking-tight text-foreground", !item.read && "font-bold text-primary")}>
            {item.title}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed pr-6">{item.message}</p>
      </div>

      {/* Inline Mark as Read Button */}
      {!item.read && (
        <button
          onClick={(e) => onMark(item.id, e)}
          className="absolute right-2 top-2 p-1 rounded-md bg-card hover:bg-muted hover:text-primary text-muted-foreground border shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
          title="Mark as read"
        >
          <Check className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
