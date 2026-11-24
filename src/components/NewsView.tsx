import { Newspaper } from 'lucide-react';
import { NewsList } from './NewsList';

export function NewsView() {
  return (
    <div className="animate-fadeIn">
      <h2 className="mb-1 flex items-center gap-2 text-xl font-extrabold text-white">
        <Newspaper className="h-5 w-5 text-emerald-400" />
        هەواڵەکان
      </h2>
      <p className="mb-5 text-xs text-gray-500">هەواڵی تۆپی پێ لە ESPN (بە ئینگلیزی)</p>
      <NewsList />
    </div>
  );
}
