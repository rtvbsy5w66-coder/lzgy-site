"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Trash2, Eye, CheckCircle } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMessages();
    }
  }, [status]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      const data = await response.json();
      // API returns array directly or wrapped in data object
      setMessages(Array.isArray(data) ? data : (data.data || data.messages || []));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/messages/${id}/read`, {
        method: "PATCH",
      });
      setMessages(
        messages.map((msg) =>
          msg.id === id ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt az üzenetet?")) {
      return;
    }

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(messages.filter((msg) => msg.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  const unreadCount = messages.filter((msg) => !msg.read).length;

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Üzenetek</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kapcsolatfelvételi űrlapról érkezett üzenetek
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full">
                {unreadCount} olvasatlan
              </span>
            )}
          </p>
        </div>

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <Mail className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Még nincsenek üzenetek</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message List */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-250px)] overflow-y-auto">
                {messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => openMessage(message)}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedMessage?.id === message.id ? "bg-indigo-50 dark:bg-indigo-900/30" : ""
                    } ${!message.read ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {message.name}
                      </p>
                      {!message.read && (
                        <span className="ml-2 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {message.subject || "Nincs tárgy"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(message.createdAt).toLocaleDateString("hu-HU")}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Detail */}
            <div className="lg:col-span-2">
              {selectedMessage ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {selectedMessage.subject || "Nincs tárgy"}
                      </h2>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          <span className="font-medium">Feladó:</span>{" "}
                          {selectedMessage.name}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          <a
                            href={`mailto:${selectedMessage.email}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {selectedMessage.email}
                          </a>
                        </p>
                        <p>
                          <span className="font-medium">Dátum:</span>{" "}
                          {new Date(
                            selectedMessage.createdAt
                          ).toLocaleString("hu-HU")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Törlés"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
                  <Mail className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Válassz egy üzenetet a megtekintéshez
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
