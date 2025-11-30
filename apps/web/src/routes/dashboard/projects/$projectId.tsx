import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { client } from "@/lib/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, MapPin, Upload, LayoutGrid, List as ListIcon } from "lucide-react";
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
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Settings content placeholder.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
