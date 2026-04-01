import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Heart, Camera, Send, Trash2, Bookmark, MoreHorizontal,
  Image as ImageIcon, Dumbbell, Utensils, Sparkles, MessageCircle,
  Video, Play, Share2, X
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
  { id: "meal", label: "Refeição", icon: Utensils, gradient: "from-green-500 to-emerald-600" },
  { id: "workout", label: "Treino", icon: Dumbbell, gradient: "from-violet-500 to-purple-600" },
  { id: "general", label: "Dia a dia", icon: Sparkles, gradient: "from-blue-500 to-cyan-600" },
];

const Social = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [newMedia, setNewMedia] = useState<File | null>(null);
  const [newMediaPreview, setNewMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [postType, setPostType] = useState("general");
  const [posting, setPosting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [likeAnimating, setLikeAnimating] = useState<string | null>(null);
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

      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select('id, "Nome Completo", avatar_url')
        .in("id", userIds);

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

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMedia(file);
      setMediaType(type);
      setNewMediaPreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!newContent.trim() && !newMedia) return;
    setPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let mediaUrl: string | null = null;
      if (newMedia) {
        const fileName = `${user.id}/${Date.now()}_${newMedia.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("social-posts")
          .upload(fileName, newMedia);
        if (uploadErr) throw uploadErr;
        const { data: publicUrl } = supabase.storage.from("social-posts").getPublicUrl(fileName);
        mediaUrl = publicUrl.publicUrl;
      }

      const { error } = await supabase.from("social_posts").insert({
        user_id: user.id,
        content: newContent.trim() || null,
        image_url: mediaUrl,
        post_type: postType,
      });

      if (error) throw error;

      setNewContent("");
      setNewMedia(null);
      setNewMediaPreview(null);
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

    if (!liked) {
      setLikeAnimating(postId);
      setTimeout(() => setLikeAnimating(null), 600);
    }

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

  const handleShare = async (post: Post) => {
    const text = `${post.user_name} partilhou no METAFIT: ${post.content || ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "METAFIT Comunidade", text, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copiado!" });
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
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}sem`;
  };

  const isVideo = (url: string | null) => {
    if (!url) return false;
    return /\.(mp4|webm|mov|avi|mkv)/i.test(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(180deg, hsl(215 28% 10%), hsl(220 25% 13%))' }}>
      {/* Instagram-style Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-border/20 backdrop-blur-xl"
        style={{ background: 'hsla(215, 28%, 10%, 0.9)' }}>
        <h1 className="text-xl font-extrabold tracking-tight" style={{ 
          background: 'linear-gradient(135deg, hsl(205 100% 60%), hsl(270 80% 65%))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Comunidade
        </h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCompose(!showCompose)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsl(205 100% 50%), hsl(270 80% 60%))' }}
        >
          {showCompose ? <X className="w-4 h-4 text-white" /> : <Send className="w-4 h-4 text-white" />}
        </motion.button>
      </div>

      {/* Stories-like type filter */}
      <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide">
        {POST_TYPES.map(t => {
          const Icon = t.icon;
          const active = postType === t.id;
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPostType(t.id)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                active ? `bg-gradient-to-br ${t.gradient}` : 'bg-muted/20 border-2 border-border/30'
              }`}>
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-[10px] font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="px-4 space-y-4">
        {/* Compose Panel */}
        <AnimatePresence>
          {showCompose && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="rounded-2xl overflow-hidden border border-border/30"
              style={{ background: 'hsl(215 30% 15%)' }}
            >
              <div className="p-4">
                <Textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="O que queres partilhar hoje? 💭"
                  className="min-h-[80px] text-sm resize-none bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  style={{ color: 'hsl(0,0%,92%)' }}
                />

                {newMediaPreview && (
                  <div className="relative mt-3 rounded-xl overflow-hidden">
                    {mediaType === "video" ? (
                      <video src={newMediaPreview} className="w-full max-h-48 object-cover rounded-xl" controls />
                    ) : (
                      <img src={newMediaPreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
                    )}
                    <button
                      onClick={() => { setNewMedia(null); setNewMediaPreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer text-[11px] font-medium transition-colors"
                      style={{ background: 'hsla(205,100%,55%,0.15)', color: 'hsl(205,100%,65%)' }}>
                      <Camera className="w-3.5 h-3.5" /> Foto
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleMediaSelect(e, "image")} />
                    </label>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer text-[11px] font-medium transition-colors"
                      style={{ background: 'hsla(270,80%,60%,0.15)', color: 'hsl(270,80%,70%)' }}>
                      <Video className="w-3.5 h-3.5" /> Vídeo
                      <input type="file" accept="video/*" className="hidden" onChange={e => handleMediaSelect(e, "video")} />
                    </label>
                  </div>
                  <Button
                    size="sm"
                    onClick={handlePost}
                    disabled={posting || (!newContent.trim() && !newMedia)}
                    className="rounded-full px-5 text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, hsl(205 100% 50%), hsl(270 80% 60%))' }}
                  >
                    {posting ? "..." : "Publicar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts Feed - Instagram Style */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsla(205,100%,55%,0.1), hsla(270,80%,60%,0.1))' }}>
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground mb-1">Sem publicações</p>
            <p className="text-sm text-muted-foreground mb-4">Sê o primeiro a partilhar!</p>
            <Button onClick={() => setShowCompose(true)} className="rounded-full px-6"
              style={{ background: 'linear-gradient(135deg, hsl(205 100% 50%), hsl(270 80% 60%))' }}>
              Criar publicação
            </Button>
          </div>
        ) : (
          posts.map((post, i) => {
            const typeConfig = getTypeConfig(post.post_type);
            const TypeIcon = typeConfig.icon;
            const videoPost = isVideo(post.image_url);
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden border border-border/20"
                style={{ background: 'hsl(215 30% 14%)' }}
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30 shrink-0"
                    style={{ background: `linear-gradient(135deg, hsl(205 100% 50%), hsl(270 80% 60%))` }}>
                    {post.avatar_url ? (
                      <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {(post.user_name || "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground truncate">{post.user_name}</span>
                      <span className="text-[10px] text-muted-foreground">· {getTimeAgo(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TypeIcon className="w-3 h-3" style={{ color: `hsl(${post.post_type === 'meal' ? '142,71%,45%' : post.post_type === 'workout' ? '270,80%,65%' : '205,100%,55%'})` }} />
                      <span className="text-[10px] font-medium text-muted-foreground">{typeConfig.label}</span>
                    </div>
                  </div>
                  {post.user_id === currentUserId && (
                    <button onClick={() => handleDelete(post.id)} className="p-2 rounded-full hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive/50" />
                    </button>
                  )}
                </div>

                {/* Media Content */}
                {post.image_url && (
                  <div className="relative w-full aspect-square bg-black/20"
                    onDoubleClick={() => !post.liked_by_me && handleLike(post.id, false)}>
                    {videoPost ? (
                      <video src={post.image_url} className="w-full h-full object-cover" controls playsInline />
                    ) : (
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    )}
                    {/* Double-tap heart animation */}
                    <AnimatePresence>
                      {likeAnimating === post.id && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1.3, opacity: 1 }}
                          exit={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <Heart className="w-20 h-20 text-white fill-white drop-shadow-2xl" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Actions */}
                <div className="px-4 py-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleLike(post.id, post.liked_by_me)}
                      >
                        <Heart className={`w-6 h-6 transition-all ${
                          post.liked_by_me ? "text-red-500 fill-red-500 scale-110" : "text-foreground"
                        }`} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleShare(post)}>
                        <Share2 className="w-5 h-5 text-foreground" />
                      </motion.button>
                    </div>
                    <Bookmark className="w-5 h-5 text-foreground cursor-pointer" />
                  </div>

                  {/* Likes count */}
                  {post.likes_count > 0 && (
                    <p className="text-xs font-bold text-foreground mb-1">
                      {post.likes_count} {post.likes_count === 1 ? "curtida" : "curtidas"}
                    </p>
                  )}

                  {/* Caption */}
                  {post.content && (
                    <p className="text-sm leading-relaxed" style={{ color: 'hsl(0,0%,88%)' }}>
                      <span className="font-bold text-foreground mr-1.5">{post.user_name?.split(' ')[0]}</span>
                      {post.content}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Social;
