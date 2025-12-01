import { createFileRoute } from "@tanstack/react-router";
import { client } from "@/lib/api";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, X } from "lucide-react";

export const Route = createFileRoute("/dashboard/projects/$projectId/setup")({
  component: ProjectSetupPage,
  loader: async ({ params }) => {
    // @ts-ignore
    const res = await client.api.projects[":projectId"].$get({
      param: { projectId: params.projectId },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch project");
    }
    return res.json();
  },
});

function ProjectSetupPage() {
  const project = Route.useLoaderData();
  const [filesToUpload, setFilesToUpload] = useState<{ title: string; file: File }[]>([]);
  const [currentFileTitle, setCurrentFileTitle] = useState("");
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description || "");
  const [projectLocation, setProjectLocation] = useState(project.location);

  const handleProjectDetailsSave = async () => {
    // @ts-ignore
    const res = await client.api.projects[":projectId"].$patch({
        param: { projectId: project.id },
        json: {
            name: projectName,
            description: projectDescription,
            location: projectLocation,
        },
    });

    if (!res.ok) {
        // Handle error
        console.error("Failed to save project details");
    } else {
        // Handle success
        console.log("Project details saved successfully");
    }
  };


  const handleAddFile = () => {
    if (currentFileTitle && currentFile) {
        setFilesToUpload([...filesToUpload, { title: currentFileTitle, file: currentFile }]);
        setCurrentFileTitle("");
        setCurrentFile(null);
        // Reset the file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    }
  };

  const handleUpload = async () => {
    if (filesToUpload.length === 0) {
        return;
    }
    const formData = new FormData();
    formData.append('projectId', project.id);
    filesToUpload.forEach((fileEntry, index) => {
        formData.append(`files[${index}][title]`, fileEntry.title);
        formData.append(`files[${index}][file]`, fileEntry.file);
    });

    try {
        // @ts-ignore
        const res = await client.api.documents.upload.$post({
            form: formData,
        });

        if (!res.ok) {
            // Handle error - e.g., show a toast notification
            console.error("Upload failed");
        } else {
            // Handle success - e.g., clear the upload list and show a success message
            setFilesToUpload([]);
            console.log("Upload successful");
        }
    } catch (error) {
        console.error("An error occurred during upload:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Setup Project: {project.name}
        </h2>
        <p className="text-muted-foreground mt-1">
          Finish setting up your project and upload relevant documents.
        </p>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Project Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="p-8 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Project Details</h3>
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                        id="project-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                        id="project-description"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="project-location">Location</Label>
                    <Input
                        id="project-location"
                        value={projectLocation}
                        onChange={(e) => setProjectLocation(e.target.value)}
                    />
                </div>
                <Button onClick={handleProjectDetailsSave}>Save Changes</Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="documents">
          <div className="p-8 border rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Upload Documents</h3>
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="file-title">File Title</Label>
                    <Input
                        id="file-title"
                        value={currentFileTitle}
                        onChange={(e) => setCurrentFileTitle(e.target.value)}
                        placeholder="e.g., 'Lease Agreement'"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="file-input">File</Label>
                    <Input
                        id="file-input"
                        type="file"
                        onChange={(e) => setCurrentFile(e.target.files ? e.target.files[0] : null)}
                    />
                </div>
                <Button onClick={handleAddFile} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add File
                </Button>

                {filesToUpload.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">Files to upload:</h4>
                        <ul className="list-disc list-inside">
                            {filesToUpload.map((file, index) => (
                                <li key={index} className="flex items-center justify-between">
                                    <span>{file.title} - {file.file.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setFilesToUpload(filesToUpload.filter((_, i) => i !== index))
                                        }
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        <Button onClick={handleUpload} className="mt-4">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload {filesToUpload.length} file(s)
                        </Button>
                    </div>
                )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
