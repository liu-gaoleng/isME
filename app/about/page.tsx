'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface About {
  name: string;
  bio: string;
  avatar: string;
}

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/public/about`
        );
        const result = await response.json();
        
        if (result.code === 200) {
          setAbout(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch about info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">关于我</h1>
          
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : about ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start gap-6">
                {about.avatar && (
                  <img
                    src={about.avatar}
                    alt={about.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {about.name || '博主'}
                  </h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {about.bio || '这个人很懒，什么都没有留下。'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-gray-600">
                这个人很懒，什么都没有留下。
              </p>
            </div>
          )}

          {/* Skills Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">技能特长</h2>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">Frontend</div>
                  <div className="text-sm text-gray-600 mt-1">React, Next.js</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">Backend</div>
                  <div className="text-sm text-gray-600 mt-1">Java, Spring Boot</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">Database</div>
                  <div className="text-sm text-gray-600 mt-1">MySQL, MongoDB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">联系方式</h2>
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-gray-600">
                如果你有任何问题或合作意向，欢迎通过以下方式联系我：
              </p>
              <div className="mt-4 space-y-2 text-gray-600">
                <p>📧 邮箱：contact@example.com</p>
                <p>📝 GitHub：github.com/yourusername</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
