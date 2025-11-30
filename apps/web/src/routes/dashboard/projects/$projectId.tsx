import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/api";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, FileText, MapPin, Upload, LayoutGrid, List as ListIcon, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { UploadDocumentDialog } from "@/components/upload-document-dialog";
import { ChatInterface } from "@/components/chat/chat-interface";

export const Route = createFileRoute("/dashboard/projects/$projectId")({
    component: ProjectDetailsPage,
    loader: async ({ params }) => {
        // @ts-ignore
        const res = await client.api.projects[":id"].$get({
            param: { id: params.projectId },
        });
        if (!res.ok) {
            throw new Error("Failed to fetch project");
        }
        return res.json();
    },
});

function ProjectDetailsPage() {
    const project = Route.useLoaderData();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description || "",
        location: project.location || "",
        phase: project.phase || "",
        launchDate: project.launchDate || "",
    });

    const updateProjectMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            // @ts-ignore
            const res = await client.api.projects[":id"].$patch({
                param: { id: project.id },
                json: data,
            });
            if (!res.ok) throw new Error("Failed to update project");
            return res.json();
        },
        onSuccess: () => {
            toast.success("Project updated successfully");
            router.invalidate();
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
        onError: () => {
            toast.error("Failed to update project");
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProjectMutation.mutate(formData);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <Link
                    to="/dashboard/projects"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {project.name}
                        </h2>
                        <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{project.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Documents</TabsTrigger>
                    <TabsTrigger value="chat" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Chat</TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <Card className="border-muted/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {project.description || "No description provided."}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium">Project Documents</h3>
                            <p className="text-sm text-muted-foreground">
                                Manage and view documents associated with this project.
                            </p>
                        </div>
                        <UploadDocumentDialog
                            projectId={project.id}
                            trigger={
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Document
                                </Button>
                            }
                        />
                    </div>

                    {project.documents && project.documents.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {project.documents.map((doc: any) => (
                                <Card key={doc.id} className="group overflow-hidden border-muted/60 transition-all hover:border-indigo-500/50 hover:shadow-md">
                                    <div className="flex h-32 items-center justify-center bg-muted/30 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-950/20 transition-colors">
                                        <FileText className="h-12 w-12 text-muted-foreground/50 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <h4 className="font-medium truncate" title={doc.name}>
                                                {doc.name}
                                            </h4>
                                            <Badge variant="secondary" className="text-[10px] uppercase">
                                                {doc.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {doc.status || "Indexed"}
                                            </span>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <ArrowLeft className="h-4 w-4 rotate-180" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-[200px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30">
                            <div className="rounded-full bg-background p-3 shadow-sm">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground">
                                No documents uploaded yet.
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="chat" className="h-[calc(100vh-16rem)]">
                    <Card className="h-full border-muted/60 shadow-sm overflow-hidden">
                        <ChatInterface projectId={project.id} />
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card className="border-muted/60 shadow-sm">
                        <CardHeader>
                            <CardTitle>Project Settings</CardTitle>
                            <CardDescription>
                                Update your project details and configuration.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Project Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter project name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter project description"
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phase">Phase</Label>
                                        <Input
                                            id="phase"
                                            name="phase"
                                            value={formData.phase}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Planning, Construction"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="launchDate">Launch Date</Label>
                                    <Input
                                        id="launchDate"
                                        name="launchDate"
                                        type="date"
                                        value={formData.launchDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={updateProjectMutation.isPending}>
                                        {updateProjectMutation.isPending ? (
                                            "Saving..."
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
