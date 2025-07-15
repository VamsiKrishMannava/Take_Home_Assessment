import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, ExternalLink, Monitor, Smartphone, Tablet, Code, Eye } from "lucide-react";

interface PreviewWindowProps {
  files: Record<string, string>;
  projectName: string;
}

export const PreviewWindow = ({ files, projectName }: PreviewWindowProps) => {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [selectedFile, setSelectedFile] = useState("index.html");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  useEffect(() => {
    if (iframeRef.current && files[selectedFile]) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(files[selectedFile]);
        doc.close();
      }
    }
  }, [files, selectedFile]);

  const getViewportWidth = () => {
    switch (viewMode) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

  const openInNewTab = () => {
    const newWindow = window.open();
    if (newWindow && files[selectedFile]) {
      newWindow.document.write(files[selectedFile]);
      newWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
            <Eye className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Live Preview</h2>
            <p className="text-sm text-muted-foreground">{projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("desktop")}
              className="h-7 px-2"
            >
              <Monitor className="w-3 h-3" />
            </Button>
            <Button
              variant={viewMode === "tablet" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tablet")}
              className="h-7 px-2"
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className="h-7 px-2"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshPreview}
            className="transition-smooth hover:bg-primary/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="transition-smooth hover:bg-primary/10"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "preview" | "code")} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 w-fit">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="flex-1 m-0">
          <div className="h-full p-4">
            <Card className="h-full flex flex-col bg-white shadow-elegant overflow-hidden">
              <div className="flex-1 flex items-center justify-center p-4">
                <div 
                  className="bg-white border rounded-lg shadow-lg transition-all duration-300"
                  style={{ 
                    width: getViewportWidth(),
                    height: viewMode === "mobile" ? "667px" : "100%",
                    maxHeight: "100%"
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full rounded-lg"
                    title={`Preview of ${projectName}`}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="code" className="flex-1 m-0">
          <div className="h-full p-4">
            <Card className="h-full flex flex-col">
              <div className="p-3 border-b">
                <select
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="bg-background border rounded px-3 py-1 text-sm w-full max-w-xs"
                >
                  {Object.keys(files).map((filename) => (
                    <option key={filename} value={filename}>
                      {filename}
                    </option>
                  ))}
                </select>
              </div>
              <ScrollArea className="flex-1">
                <pre className="p-4 text-sm font-mono bg-muted/50 text-foreground whitespace-pre-wrap">
                  {files[selectedFile] || "No content"}
                </pre>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};