import { createFileRoute } from "@tanstack/react-router";
import { client } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
                    <p className="text-muted-foreground">{project.location}</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {project.description || "No description provided."}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="documents" className="space-y-4">
                    <div className="flex justify-between">
                        <h3 className="text-lg font-medium">Project Documents</h3>
                        <UploadDocumentDialog
                            projectId={project.id}
                            trigger={
                                <Button>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Document
                                </Button>
                            }
                        />
                    </div>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {project.documents && project.documents.length > 0 ? (
                                    project.documents.map((doc: any) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    {doc.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{doc.type}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                    {doc.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No documents uploaded yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
                <TabsContent value="chat" className="h-[calc(100vh-16rem)]">
                    <ChatInterface projectId={project.id} />
                </TabsContent>
                <TabsContent value="settings" className="space-y-4">
                    <Card>
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
