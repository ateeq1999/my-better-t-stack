import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: session?.user?.name || "",
      image: session?.user?.image || "",
    },
    // @ts-ignore
    validatorAdapter: zodValidator() as any,
    onSubmit: async ({ value }) => {
      try {
        // @ts-ignore
        const res = await client.api.users.me.$patch({
          json: value,
        });

        if (!res.ok) {
          throw new Error("Failed to update profile");
        }

        toast.success("Profile updated successfully");
        // Invalidate session to refresh data
        queryClient.invalidateQueries({ queryKey: ["session"] });
        // Force reload to update session in auth client if needed, or rely on invalidate
        window.location.reload();
      } catch (error) {
        toast.error("Failed to update profile");
        console.error(error);
      }
    },
  });

  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session.user.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={session.user.role} disabled className="capitalize" />
              <p className="text-xs text-muted-foreground">Role is managed by the administrator.</p>
            </div>

            <form.Field
              name="name"
              validators={{
                onChange: z.string().min(1, "Name is required"),
              }}
              children={(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors ? (
                    <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="image"
              validators={{
                onChange: z.string().url("Must be a valid URL").optional().or(z.literal("")),
              }}
              children={(field) => (
                <div className="grid gap-2">
                  <Label htmlFor="image">Profile Image URL</Label>
                  <Input
                    id="image"
                    name={field.name}
                    value={field.state.value || ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {field.state.meta.errors ? (
                    <p className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</p>
                  ) : null}
                </div>
              )}
            />

            <div className="flex justify-end">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
