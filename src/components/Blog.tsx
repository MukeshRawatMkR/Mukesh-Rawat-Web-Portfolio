import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, ExternalLink, Tag, User, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  author: string;
  tags: string[];
  categories: string[];
  mediumUrl: string;
  imageUrl?: string;
  publishedAt: string;
  readingTime: number;
  featured: boolean;
  views: number;
  formattedDate: string;
  timeAgo: string;
}

interface BlogResponse {
  status: string;
  results: number;
  totalResults: number;
  totalPages: number;
  currentPage: number;
  data: {
    posts: BlogPost[];
    featuredPosts?: BlogPost[];
  };
}

const Blog = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const fetchBlogPosts = async (page = 1, search = '', tags = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        ...(search && { search }),
        ...(tags && { tags }),
      });

      const response = await fetch(`/api/blog?${params}`);
      const data: BlogResponse = await response.json();

      if (data.status === 'success') {
        setPosts(data.data.posts);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);

        if (data.data.featuredPosts && page === 1 && !search && !tags) {
          setFeaturedPosts(data.data.featuredPosts);
        }

        // Extract unique tags
        const tags = data.data.posts.flatMap(post => post.tags);
        const uniqueTags = [...new Set(tags)].sort();
        setAllTags(uniqueTags);
      } else {
        throw new Error(data.message || 'Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error loading blog posts",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts(1, searchTerm, selectedTag);
  }, [searchTerm, selectedTag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogPosts(1, searchTerm, selectedTag);
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBlogPosts(page, searchTerm, selectedTag);
    
    // Scroll to top of blog section
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const BlogCard = ({ post, featured = false }: { post: BlogPost; featured?: boolean }) => (
    <article 
      className={`portfolio-card group ${featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
    >
      {/* Image */}
      {post.imageUrl && (
        <div className="relative overflow-hidden rounded-lg mb-6">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                Featured
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <time dateTime={post.publishedAt}>{post.formattedDate}</time>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{post.readingTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{post.author}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {post.description}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <button
                key={index}
                onClick={() => handleTagFilter(tag)}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary'
                }`}
              >
                <Tag size={10} />
                {tag}
              </button>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            {post.views} views
          </div>
          <a
            href={post.mediumUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors font-medium"
          >
            Read on Medium
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </article>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="text-muted-foreground">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-muted'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-muted-foreground">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <section ref={sectionRef} id="blog" className="section-container">
      <div className="max-w-7xl mx-auto">
        <div className={`fade-in ${isVisible ? 'visible' : ''}`}>
          <h2 className="section-title">Blog & Articles</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto text-lg">
            Thoughts, tutorials, and insights about web development, technology, and design.
            All articles are originally published on Medium.
          </p>

          {/* Search and Filter */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </form>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <button
                  onClick={() => handleTagFilter('')}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    !selectedTag
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  All
                </button>
                {allTags.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedTag === tag
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            /* Loading State */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="portfolio-card animate-pulse">
                  <div className="bg-muted h-48 rounded-lg mb-6"></div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-muted h-4 w-20 rounded"></div>
                      <div className="bg-muted h-4 w-16 rounded"></div>
                    </div>
                    <div className="bg-muted h-6 w-3/4 rounded"></div>
                    <div className="bg-muted h-4 w-full rounded"></div>
                    <div className="bg-muted h-4 w-2/3 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {featuredPosts.length > 0 && !searchTerm && !selectedTag && (
                <div className="mb-16">
                  <h3 className="text-2xl font-bold mb-8 text-center">Featured Articles</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredPosts.map((post) => (
                      <BlogCard key={post._id} post={post} featured />
                    ))}
                  </div>
                </div>
              )}

              {/* All Posts */}
              {posts.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                      <div
                        key={post._id}
                        className={`fade-in ${isVisible ? 'visible' : ''}`}
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <BlogCard post={post} />
                      </div>
                    ))}
                  </div>
                  <Pagination />
                </>
              ) : (
                /* No Posts Found */
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || selectedTag
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Blog posts will appear here once they are published.'}
                  </p>
                  {(searchTerm || selectedTag) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedTag('');
                      }}
                      className="btn-hero"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Blog;