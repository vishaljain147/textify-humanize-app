
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OutputCard from "@/components/OutputCard";
import { getTextHistory, toggleFavorite, deleteTextEntry, TextEntry } from "@/lib/api";
import { Search, Trash } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function History() {
  const [history, setHistory] = useState<TextEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const savedHistory = getTextHistory();
    setHistory(savedHistory);
  }, []);

  const handleFavoriteToggle = (id: string) => {
    const updatedEntry = toggleFavorite(id);
    if (updatedEntry) {
      setHistory(prevHistory => 
        prevHistory.map(entry => 
          entry.id === id ? updatedEntry : entry
        )
      );
    }
  };

  const handleDelete = (id: string) => {
    const deleted = deleteTextEntry(id);
    if (deleted) {
      setHistory(prevHistory => prevHistory.filter(entry => entry.id !== id));
      toast("Entry deleted");
    }
  };

  const filteredHistory = history.filter(entry => {
    // Filter by search term
    const matchesSearch = 
      entry.humanizedText.toLowerCase().includes(searchTerm.toLowerCase()) || 
      entry.originalText.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tab
    if (activeTab === "favorites" && !entry.isFavorite) {
      return false;
    }
    
    return matchesSearch;
  });

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">History</h1>
      <p className="text-center text-muted-foreground mb-8">
        View and manage your previous humanized texts
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Humanized Texts</CardTitle>
          <CardDescription>
            Search, favorite, and manage your previous conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Entries</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-4">
              {filteredHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No matching entries found" : "No history entries yet"}
                </p>
              ) : (
                filteredHistory.map(entry => (
                  <div key={entry.id} className="relative">
                    <OutputCard
                      output={entry.humanizedText}
                      tone={entry.tone}
                      timestamp={new Date(entry.timestamp).toLocaleString()}
                      isFavorite={entry.isFavorite}
                      onFavoriteToggle={() => handleFavoriteToggle(entry.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="space-y-4 mt-4">
              {filteredHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No matching favorites found" : "No favorites yet"}
                </p>
              ) : (
                filteredHistory.map(entry => (
                  <div key={entry.id} className="relative">
                    <OutputCard
                      output={entry.humanizedText}
                      tone={entry.tone}
                      timestamp={new Date(entry.timestamp).toLocaleString()}
                      isFavorite={entry.isFavorite}
                      onFavoriteToggle={() => handleFavoriteToggle(entry.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
