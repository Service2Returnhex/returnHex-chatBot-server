
import TokenUsagePage from "@/components/adminDashboard/TokenUsage";
interface PageProps {
    params: { id: string };
}

export default function TokenUsage({ params }: PageProps) {
    return (
        <>
            <TokenUsagePage
                id={params.id}
            />
        </>
    )
}

