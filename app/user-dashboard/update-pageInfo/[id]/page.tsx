import UpdatePageInfo from "@/components/userDashboard/updatePageInfo";

interface PageProps {
    params: { id: string };
}

export default async function UpdatePage({ params }: PageProps) {
    console.log("params id", params.id);
    const id = await params.id;
    return (
        <>
            <UpdatePageInfo
                id={id}
            />
        </>
    )
}