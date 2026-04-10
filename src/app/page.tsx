"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Chuyển hướng sang trang login ngay khi component mount
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <p className="text-sm text-gray-500 font-medium">
          Đang chuyển hướng...
        </p>
      </div>
    </div>
  );
}
