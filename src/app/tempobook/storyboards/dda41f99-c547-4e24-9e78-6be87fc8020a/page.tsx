import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminChapterManagementStoryboard() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Chapter Management</CardTitle>
            <CardDescription>
              Add, edit, or remove chapters for manhwa series
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Chapter management interface would appear here</p>
              <p className="mt-2 text-sm">
                This component requires client-side functionality
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
