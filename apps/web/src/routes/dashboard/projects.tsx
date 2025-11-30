import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { client } from "@/lib/api";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Projects
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your real estate projects and documents.
          </p>
        </div>
        <CreateProjectDialog
          trigger={
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full flex h-[300px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/50">
            <div className="rounded-full bg-background p-4 shadow-sm">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
            <p className="text-sm text-muted-foreground">
              Get started by creating your first project.
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="h-full overflow-hidden border-muted/60 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className="h-32 w-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 group-hover:from-indigo-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 transition-colors" />
              <CardHeader className="-mt-12 relative z-10">
                <div className="mb-3 inline-flex rounded-lg bg-background p-2 shadow-sm ring-1 ring-border">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                <Link
                  to="/dashboard/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="group"
                >
                  <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                    {project.name}
                  </CardTitle>
                </Link>
                <CardDescription className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                  {project.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
                  {project.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard/projects/$projectId/setup" params={{ projectId: project.id }}>
                  <Button variant="outline" size="sm">Setup</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
