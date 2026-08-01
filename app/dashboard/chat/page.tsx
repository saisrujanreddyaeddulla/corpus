import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="px-8 pt-8 pb-2 flex-shrink-0">
        <h1 className="font-display text-3xl text-paper">Chat</h1>
      </div>
      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
}
