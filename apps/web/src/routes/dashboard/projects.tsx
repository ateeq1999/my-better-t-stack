import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { client } from "@/lib/api";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/projects")({
  component: ProjectsPage,
  loader: async () => {
    // @ts-ignore
    const res = await client.api.projects.$get();
    if (!res.ok) {
      throw new Error("Failed to fetch projects");
    }
    return res.json();
  },
});

function ProjectsPage() {
  const projects = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
        <CreateProjectDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          }
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">No projects found</p>
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              to="/dashboard/projects/$projectId"
              params={{ projectId: project.id }}
              className="block transition-transform hover:scale-[1.02]"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
