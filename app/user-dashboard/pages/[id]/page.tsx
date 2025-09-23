import TokenUsagePage from "@/components/userDashboard/TokenUsage";

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

