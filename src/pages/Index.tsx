import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Welcome to Your Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/dashboard/reddit-posts">
            <Button variant="outline" className="w-full h-32 flex flex-col gap-2">
              <span className="text-lg font-semibold">My Reddit Posts</span>
              <span className="text-sm text-muted-foreground">View and manage your saved Reddit posts</span>
            </Button>
          </Link>
          {/* Add more dashboard cards here in the future */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;