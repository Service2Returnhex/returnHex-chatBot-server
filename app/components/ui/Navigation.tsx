import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useNavigate } from "react-router-dom";

interface NavigationProps {
  title: string;
  showBack?: boolean;
}

export default function Navigation({
  title,
  showBack = true,
}: NavigationProps) {
  const router = useRouter();
  //   const navigate = useNavigate();
  return (
    <div className="bg-blue-500 shadow-md  z-50 relative">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              //   variant="ghost"
              //   size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 flex py-2 px-4 rounded-md cursor-pointer"
            >
              <ArrowLeft className="h-full w-full mr-2" />
              Back
            </button>
          )}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
      </div>
    </div>
  );
}
