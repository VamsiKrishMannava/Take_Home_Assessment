import { Project } from "./MainLayout";
import { ProjectDialog } from "./ProjectDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Code, Sparkles, Calendar, FileText } from "lucide-react";

interface HeaderProps {
  currentProject: Project;
  projects: Project[];
  onProjectChange: (project: Project) => void;
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: string) => void;
  onNewProject: () => void;
}

export const Header = ({ currentProject, projects, onProjectChange, onProjectUpdated, onProjectDeleted, onNewProject }: HeaderProps) => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AppBuilder AI
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-muted-foreground" />
            <Select
              value={currentProject.id}
              onValueChange={(value) => {
                const project = projects.find(p => p.id === value);
                if (project) onProjectChange(project);
              }}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{project.name}</span>
                        {project.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {project.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {project.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
            <FileText className="w-4 h-4" />
            <span>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          </div>
          
          <ProjectDialog
            project={currentProject}
            onProjectUpdated={onProjectUpdated}
            onProjectDeleted={onProjectDeleted}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={onNewProject}
            className="transition-smooth hover:bg-primary/10 hover:border-primary/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>
    </header>
  );
};