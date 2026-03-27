import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Heart, Camera, Send, ArrowLeft, Trash2,
  Image as ImageIcon, Dumbbell, Utensils, Sparkles, MessageCircle
} from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  post_type: string;
  created_at: string;
  user_name?: string;
  avatar_url?: string;
  likes_count: number;
  liked_by_me: boolean;
}

const POST_TYPES = [
  { id: "meal", label: "Refeição", icon: Utensils, color: "hsl(142,71%,45%)" },
  { id: "workout", label: "Treino", icon: Dumbbell, color: "hsl(270,80%,65%)" },
  { id: "general", label: "Dia a dia", icon: Sparkles, color: "hsl(205,100%,55%)" },
];

const Social = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [postType, setPostType] = useState("general");
  const [posting, setPosting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setCurrentUserId(user.id);

      const { data: postsData } = await supabase
        .from("social_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!postsData) { setLoading(false); return; }

      // Get unique user ids
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select('id, "Nome Completo", avatar_url')
        .in("id", userIds);

      // Get likes
      const postIds = postsData.map(p => p.id);
      const { data: allLikes } = await supabase
        .from("social_likes")
        .select("post_id, user_id")
        .in("post_id", postIds);

      const enriched: Post[] = postsData.map(p => {
        const profile = profiles?.find(pr => pr.id === p.user_id);
        const postLikes = allLikes?.filter(l => l.post_id === p.id) || [];
        return {
          ...p,
          user_name: profile?.["Nome Completo"] || "Utilizador",
          avatar_url: profile?.avatar_url,
          likes_count: postLikes.length,
          liked_by_me: postLikes.some(l => l.user_id === user.id),
        };
      });

      setPosts(enriched);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!newContent.trim() && !newImage) return;
    setPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let imageUrl: string | null = null;
      if (newImage) {
        const fileName = `${user.id}/${Date.now()}_${newImage.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("social-posts")
          .upload(fileName, newImage);
        if (uploadErr) throw uploadErr;
        const { data: publicUrl } = supabase.storage.from("social-posts").getPublicUrl(fileName);
        imageUrl = publicUrl.publicUrl;
      }

      const { error } = await supabase.from("social_posts").insert({
        user_id: user.id,
        content: newContent.trim() || null,
        image_url: imageUrl,
        post_type: postType,
      });

      if (error) throw error;

      setNewContent("");
      setNewImage(null);
      setNewImagePreview(null);
      setShowCompose(false);
      toast({ title: "Publicado! 🎉" });
      loadPosts();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string, liked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked_by_me: !liked, likes_count: liked ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ));

    if (liked) {
      await supabase.from("social_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("social_likes").insert({ post_id: postId, user_id: user.id });
    }
  };

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from("social_posts").delete().eq("id", postId);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: "Eliminado!" });
    }
  };

  const getTypeConfig = (type: string) => POST_TYPES.find(t => t.id === type) || POST_TYPES[2];

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-4 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Comunidade</h1>
              <p className="text-[10px] text-muted-foreground">Partilha o teu progresso</p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCompose(!showCompose)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </motion.button>
        </div>

        {/* Compose */}
        <AnimatePresence>
          {showCompose && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <Card className="p-4 border-primary/30 bg-card">
                {/* Type selector */}
                <div className="flex gap-2 mb-3">
                  {POST_TYPES.map(t => {
                    const Icon = t.icon;
                    const active = postType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setPostType(t.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                          active ? "text-white shadow-md" : "bg-muted/50 text-muted-foreground"
                        }`}
                        style={active ? { background: t.color } : {}}
                      >
                        <Icon className="w-3 h-3" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <Textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="O que estás a partilhar hoje?"
                  className="min-h-[60px] text-sm resize-none border-border/50"
                />

                {newImagePreview && (
                  <div className="relative mt-2 rounded-lg overflow-hidden">
                    <img src={newImagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <button
                      onClick={() => { setNewImage(null); setNewImagePreview(null); }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 cursor-pointer text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    Foto
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                  <Button
                    size="sm"
                    onClick={handlePost}
                    disabled={posting || (!newContent.trim() && !newImage)}
                    className="rounded-full px-5"
                  >
                    {posting ? "A publicar..." : "Publicar"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts Feed */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <MessageCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-3">Sem publicações ainda</p>
              <Button size="sm" onClick={() => setShowCompose(true)}>Ser o primeiro!</Button>
            </Card>
          ) : (
            posts.map((post, i) => {
              const typeConfig = getTypeConfig(post.post_type);
              const TypeIcon = typeConfig.icon;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="overflow-hidden border-border/40">
                    {/* Post header */}
                    <div className="flex items-center gap-3 p-3 pb-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                        {post.avatar_url ? (
                          <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-primary">
                            {(post.user_name || "U")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {post.user_name}
                          </span>
                          <div
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}
                          >
                            <TypeIcon className="w-2.5 h-2.5" />
                            {typeConfig.label}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{getTimeAgo(post.created_at)}</span>
                      </div>
                      {post.user_id === currentUserId && (
                        <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    {post.content && (
                      <p className="px-3 pb-2 text-sm text-foreground leading-relaxed">{post.content}</p>
                    )}

                    {/* Image */}
                    {post.image_url && (
                      <div className="relative">
                        <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" loading="lazy" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 px-3 py-2.5 border-t border-border/30">
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleLike(post.id, post.liked_by_me)}
                        className="flex items-center gap-1.5"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            post.liked_by_me ? "text-red-500 fill-red-500" : "text-muted-foreground"
                          }`}
                        />
                        <span className={`text-xs font-semibold ${
                          post.liked_by_me ? "text-red-500" : "text-muted-foreground"
                        }`}>
                          {post.likes_count > 0 ? post.likes_count : ""}
                        </span>
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Social;
