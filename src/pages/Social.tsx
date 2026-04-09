import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Heart, Camera, Send, Trash2,
  Dumbbell, Utensils, Sparkles, MessageCircle,
  Video, Share2, X, SmilePlus, ChevronDown, ChevronUp
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
  comments: Comment[];
  comments_count: number;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  avatar_url?: string;
}

const POST_TYPES = [
  { id: "meal", label: "Refeição", icon: Utensils, color: "hsl(142,71%,45%)" },
  { id: "workout", label: "Treino", icon: Dumbbell, color: "hsl(270,80%,65%)" },
  { id: "general", label: "Dia a dia", icon: Sparkles, color: "hsl(205,100%,55%)" },
];

const EMOJI_LIST = ["❤️","🔥","💪","👏","😍","🎉","💯","🏆","⭐","🥗","🏋️","😂","😊","👍","🙌","✨","🥳","💙","🍽️","💚"];
const STICKERS = ["🦁","🐘","🌍","🥇","👑","💎","🚀","🎯","🌟","🔱"];

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const POSTS_PER_PAGE = 20;

  useEffect(() => { loadPosts(0, true); }, []);

  const loadPosts = async (pageNum = 0, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setCurrentUserId(user.id);

      const from = pageNum * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data: postsData } = await supabase
        .from("social_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!postsData) { setLoading(false); setLoadingMore(false); return; }

      setHasMore(postsData.length === POSTS_PER_PAGE);
      setPage(pageNum);

      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select('id, "Nome Completo", avatar_url')
        .in("id", userIds);

      const postIds = postsData.map(p => p.id);
      
      const [{ data: allLikes }, { data: allComments }] = await Promise.all([
        supabase.from("social_likes").select("post_id, user_id").in("post_id", postIds),
        supabase.from("social_comments").select("*").in("post_id", postIds).order("created_at", { ascending: true }),
      ]);

      const commentUserIds = [...new Set((allComments || []).map(c => c.user_id))];
      const allProfileIds = [...new Set([...userIds, ...commentUserIds])];
      const { data: allProfiles } = allProfileIds.length > profiles?.length! 
        ? await supabase.from("profiles").select('id, "Nome Completo", avatar_url').in("id", allProfileIds)
        : { data: profiles };

      const enriched: Post[] = postsData.map(p => {
        const profile = (allProfiles || profiles)?.find(pr => pr.id === p.user_id);
        const postLikes = allLikes?.filter(l => l.post_id === p.id) || [];
        const postComments: Comment[] = (allComments?.filter(c => c.post_id === p.id) || []).map(c => {
          const cp = (allProfiles || profiles)?.find(pr => pr.id === c.user_id);
          return { ...c, user_name: cp?.["Nome Completo"] || "Utilizador", avatar_url: cp?.avatar_url };
        });
        return {
          ...p,
          user_name: profile?.["Nome Completo"] || "Utilizador",
          avatar_url: profile?.avatar_url,
          likes_count: postLikes.length,
          liked_by_me: postLikes.some(l => l.user_id === user.id),
          comments: postComments,
          comments_count: postComments.length,
        };
      });
      if (reset) setPosts(enriched);
      else setPosts(prev => [...prev, ...enriched]);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (file) { setNewMedia(file); setMediaType(type); setNewMediaPreview(URL.createObjectURL(file)); }
  };

  const insertEmoji = (emoji: string) => {
    setNewContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const insertCommentEmoji = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    setShowCommentEmoji(false);
    commentInputRef.current?.focus();
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
        const { error: uploadErr } = await supabase.storage.from("social-posts").upload(fileName, newMedia);
        if (uploadErr) throw uploadErr;
        const { data: publicUrl } = supabase.storage.from("social-posts").getPublicUrl(fileName);
        mediaUrl = publicUrl.publicUrl;
      }
      const { error } = await supabase.from("social_posts").insert({
        user_id: user.id, content: newContent.trim() || null, image_url: mediaUrl, post_type: postType,
      });
      if (error) throw error;
      setNewContent(""); setNewMedia(null); setNewMediaPreview(null); setShowCompose(false);
      toast({ title: "Publicado! 🎉" });
      loadPosts();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally { setPosting(false); }
  };

  const handleLike = async (postId: string, liked: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!liked) { setLikeAnimating(postId); setTimeout(() => setLikeAnimating(null), 600); }
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked_by_me: !liked, likes_count: liked ? p.likes_count - 1 : p.likes_count + 1 } : p
    ));
    if (liked) {
      await supabase.from("social_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("social_likes").insert({ post_id: postId, user_id: user.id });
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("social_comments").insert({
      post_id: postId, user_id: user.id, content: commentText.trim(),
    });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setCommentText("");
    setShowCommentEmoji(false);
    loadPosts();
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from("social_comments").delete().eq("id", commentId);
    loadPosts();
  };

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from("social_posts").delete().eq("id", postId);
    if (!error) { setPosts(prev => prev.filter(p => p.id !== postId)); toast({ title: "Eliminado!" }); }
  };

  const handleShare = async (post: Post) => {
    const text = `${post.user_name} partilhou no METAFIT: ${post.content || ""}`;
    if (navigator.share) {
      try { await navigator.share({ title: "METAFIT Comunidade", text, url: window.location.href }); } catch {}
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
  const isVideo = (url: string | null) => url ? /\.(mp4|webm|mov|avi|mkv)/i.test(url) : false;

  const toggleExpandComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-border backdrop-blur-xl bg-card/95">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">
          Comunidade
        </h1>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCompose(!showCompose)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-primary"
        >
          {showCompose ? <X className="w-4 h-4 text-primary-foreground" /> : <Send className="w-4 h-4 text-primary-foreground" />}
        </motion.button>
      </div>

      {/* Category filter */}
      <div className="flex gap-3 px-4 py-3 border-b border-border/50">
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
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                active ? 'border-primary bg-primary/15' : 'border-border bg-muted/30'
              }`}>
                <Icon className="w-5 h-5" style={{ color: active ? t.color : 'hsl(var(--muted-foreground))' }} />
              </div>
              <span className={`text-[10px] font-bold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="px-3 py-3 space-y-4">
        {/* Compose */}
        <AnimatePresence>
          {showCompose && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="rounded-2xl overflow-hidden border border-border bg-card shadow-lg"
            >
              <div className="p-4">
                <Textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="O que queres partilhar hoje? 💭"
                  className="min-h-[80px] text-sm resize-none bg-muted/30 border-border text-foreground placeholder:text-muted-foreground"
                />

                {/* Emoji picker for compose */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-3 rounded-xl bg-muted/50 border border-border"
                    >
                      <p className="text-[10px] font-bold text-muted-foreground mb-2">Emojis</p>
                      <div className="flex flex-wrap gap-2">
                        {EMOJI_LIST.map(e => (
                          <button key={e} onClick={() => insertEmoji(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground mb-2 mt-3">Stickers</p>
                      <div className="flex flex-wrap gap-2">
                        {STICKERS.map(s => (
                          <button key={s} onClick={() => insertEmoji(s)} className="text-2xl hover:scale-125 transition-transform">{s}</button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {newMediaPreview && (
                  <div className="relative mt-3 rounded-xl overflow-hidden">
                    {mediaType === "video" ? (
                      <video src={newMediaPreview} className="w-full max-h-48 object-cover rounded-xl" controls />
                    ) : (
                      <img src={newMediaPreview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
                    )}
                    <button onClick={() => { setNewMedia(null); setNewMediaPreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex gap-1.5">
                    <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-full cursor-pointer text-[11px] font-semibold bg-primary/10 text-primary">
                      <Camera className="w-3.5 h-3.5" /> Foto
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleMediaSelect(e, "image")} />
                    </label>
                    <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-full cursor-pointer text-[11px] font-semibold bg-accent/10 text-accent">
                      <Video className="w-3.5 h-3.5" /> Vídeo
                      <input type="file" accept="video/*" className="hidden" onChange={e => handleMediaSelect(e, "video")} />
                    </label>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    >
                      <SmilePlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Button
                    size="sm"
                    onClick={handlePost}
                    disabled={posting || (!newContent.trim() && !newMedia)}
                    className="rounded-full px-5 text-xs font-bold bg-primary text-primary-foreground"
                  >
                    {posting ? "..." : "Publicar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary/10">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground mb-1">Sem publicações</p>
            <p className="text-sm text-muted-foreground mb-4">Sê o primeiro a partilhar!</p>
            <Button onClick={() => setShowCompose(true)} className="rounded-full px-6 bg-primary text-primary-foreground">
              Criar publicação
            </Button>
          </div>
        ) : (
          posts.map((post, i) => {
            const typeConfig = getTypeConfig(post.post_type);
            const TypeIcon = typeConfig.icon;
            const videoPost = isVideo(post.image_url);
            const isExpanded = expandedComments.has(post.id);
            const visibleComments = isExpanded ? post.comments : post.comments.slice(-2);

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30 shrink-0 bg-primary">
                    {post.avatar_url ? (
                      <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
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
                      <TypeIcon className="w-3 h-3" style={{ color: typeConfig.color }} />
                      <span className="text-[10px] font-medium text-muted-foreground">{typeConfig.label}</span>
                    </div>
                  </div>
                  {post.user_id === currentUserId && (
                    <button onClick={() => handleDelete(post.id)} className="p-2 rounded-full hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>

                {/* Media */}
                {post.image_url && (
                  <div className="relative w-full aspect-square bg-muted/20"
                    onDoubleClick={() => !post.liked_by_me && handleLike(post.id, false)}>
                    {videoPost ? (
                      <video src={post.image_url} className="w-full h-full object-cover" controls playsInline />
                    ) : (
                      <img src={post.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    )}
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
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleLike(post.id, post.liked_by_me)}>
                        <Heart className={`w-6 h-6 transition-all ${post.liked_by_me ? "text-red-500 fill-red-500" : "text-foreground"}`} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
                        setCommentingPostId(commentingPostId === post.id ? null : post.id);
                        setCommentText("");
                        setTimeout(() => commentInputRef.current?.focus(), 100);
                      }}>
                        <MessageCircle className="w-5.5 h-5.5 text-foreground" />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleShare(post)}>
                        <Share2 className="w-5 h-5 text-foreground" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Likes & comments count */}
                  <div className="flex items-center gap-3 mb-1">
                    {post.likes_count > 0 && (
                      <p className="text-xs font-bold text-foreground">
                        {post.likes_count} {post.likes_count === 1 ? "curtida" : "curtidas"}
                      </p>
                    )}
                    {post.comments_count > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {post.comments_count} {post.comments_count === 1 ? "comentário" : "comentários"}
                      </p>
                    )}
                  </div>

                  {/* Caption */}
                  {post.content && (
                    <p className="text-sm leading-relaxed text-foreground">
                      <span className="font-bold mr-1.5">{post.user_name?.split(' ')[0]}</span>
                      {post.content}
                    </p>
                  )}

                  {/* Comments Section */}
                  {post.comments.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {post.comments.length > 2 && !isExpanded && (
                        <button onClick={() => toggleExpandComments(post.id)} className="text-[11px] text-muted-foreground font-semibold flex items-center gap-0.5">
                          <ChevronDown className="w-3 h-3" /> Ver todos os {post.comments.length} comentários
                        </button>
                      )}
                      {visibleComments.map(c => (
                        <div key={c.id} className="flex items-start gap-2 group">
                          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center mt-0.5">
                            {c.avatar_url ? (
                              <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[8px] font-bold text-muted-foreground">{(c.user_name || "U")[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-foreground leading-snug">
                              <span className="font-bold mr-1">{c.user_name?.split(' ')[0]}</span>
                              {c.content}
                            </p>
                            <span className="text-[9px] text-muted-foreground">{getTimeAgo(c.created_at)}</span>
                          </div>
                          {c.user_id === currentUserId && (
                            <button onClick={() => handleDeleteComment(c.id)} className="opacity-0 group-hover:opacity-100 p-1">
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      ))}
                      {isExpanded && post.comments.length > 2 && (
                        <button onClick={() => toggleExpandComments(post.id)} className="text-[11px] text-muted-foreground font-semibold flex items-center gap-0.5">
                          <ChevronUp className="w-3 h-3" /> Esconder
                        </button>
                      )}
                    </div>
                  )}

                  {/* Comment Input */}
                  <AnimatePresence>
                    {commentingPostId === post.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        {/* Comment emoji picker */}
                        <AnimatePresence>
                          {showCommentEmoji && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mb-2 p-2 rounded-lg bg-muted/50 border border-border"
                            >
                              <div className="flex flex-wrap gap-1.5">
                                {[...EMOJI_LIST, ...STICKERS].map((e, idx) => (
                                  <button key={idx} onClick={() => insertCommentEmoji(e)} className="text-lg hover:scale-125 transition-transform">{e}</button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setShowCommentEmoji(!showCommentEmoji)}>
                            <SmilePlus className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                          </button>
                          <Textarea
                            ref={commentInputRef}
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Adicionar comentário..."
                            className="min-h-[36px] max-h-[72px] text-xs resize-none flex-1 bg-muted/30 border-border text-foreground placeholder:text-muted-foreground py-2"
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(post.id); } }}
                          />
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => handleComment(post.id)}
                            disabled={!commentText.trim()}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-primary disabled:opacity-40"
                          >
                            <Send className="w-3.5 h-3.5 text-primary-foreground" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
