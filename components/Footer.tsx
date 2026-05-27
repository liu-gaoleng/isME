import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} 我的个人网站. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
              博客
            </Link>
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
              关于
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
