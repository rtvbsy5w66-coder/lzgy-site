// Quick script to extract mock posts from main route file
const fs = require('fs');

const content = fs.readFileSync('/Users/lovas.zoltan/Seafile/Saját kötet/Me, Myself and I/webpage/lovas-political-site/src/app/api/posts/route.ts', 'utf8');

// Find the mockPosts array
const start = content.indexOf('const mockPosts = [');
const end = content.indexOf('];', start) + 2;

const mockPostsSection = content.substring(start, end);

// Transform for the [id] route - add newsCategory mapping
const transformed = mockPostsSection.replace(/const mockPosts = \[/, '// Mock posts with newsCategory mapping\nconst mockPosts = [')
  .replace(/(\},\s*\{)/g, (match, p1) => {
    return p1.replace('},', '},\n    newsCategory: mockPost.category ? {\n      id: mockPost.category,\n      name: mockPost.category,\n      color: NEWS_CATEGORY_COLORS[mockPost.category as keyof typeof NEWS_CATEGORY_COLORS]?.primary || "#6b7280"\n    } : undefined\n  },\n  {');
  });

console.log(transformed);