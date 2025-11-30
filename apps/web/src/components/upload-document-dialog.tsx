import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { client } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

export function UploadDocumentDialog({
    projectId,
    trigger,
    onSuccess,
}: {
    projectId: string;
    trigger: React.ReactNode;
    onSuccess?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        // Append projectId manually as it might not be in the form if we don't put a hidden input
        // But the server expects 'projectId' in the body.
        formData.append("projectId", projectId);

        try {
            const res = await client.api.documents.$post({
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Failed to upload document");
            }

            toast.success("Document uploaded successfully");
            setOpen(false);
            onSuccess?.();
            router.invalidate();
        } catch (error) {
            toast.error("Failed to upload document");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Upload a PDF or text file to be indexed by Gemini.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file" className="text-right">
                                File
                            </Label>
                            <Input
                                id="file"
                                name="file"
                                type="file"
                                accept=".pdf,.txt,.md"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <select
                                id="type"
                                name="type"
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="brochure">Brochure</option>
                                <option value="floor_plan">Floor Plan</option>
                                <option value="contract">Contract</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Uploading..." : "Upload"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
