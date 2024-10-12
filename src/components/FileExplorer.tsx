import React, { useState, useEffect } from 'react';
import { Folder, File, Trash, Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
}

const FileExplorer: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    // Load file system from local storage or API
    const savedFileSystem = localStorage.getItem('fileSystem');
    if (savedFileSystem) {
      setFileSystem(JSON.parse(savedFileSystem));
    }
  }, []);

  useEffect(() => {
    // Save file system to local storage
    localStorage.setItem('fileSystem', JSON.stringify(fileSystem));
  }, [fileSystem]);

  const handleCreateItem = (type: 'file' | 'folder') => {
    const newItem: FileSystemItem = {
      id: Date.now().toString(),
      name: type === 'file' ? 'New File' : 'New Folder',
      type,
      content: type === 'file' ? '' : undefined,
    };
    setFileSystem([...fileSystem, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    setFileSystem(fileSystem.filter(item => item.id !== id));
  };

  const handleEditItem = (item: FileSystemItem) => {
    setSelectedItem(item);
    setEditedContent(item.content || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedItem) {
      setFileSystem(fileSystem.map(item =>
        item.id === selectedItem.id ? { ...item, content: editedContent } : item
      ));
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4">
        <Button onClick={() => handleCreateItem('file')}><Plus className="mr-2" />New File</Button>
        <Button onClick={() => handleCreateItem('folder')}><Plus className="mr-2" />New Folder</Button>
      </div>
      <div className="space-y-2">
        {fileSystem.map(item => (
          <div key={item.id} className="flex items-center space-x-2">
            {item.type === 'folder' ? <Folder /> : <File />}
            <span>{item.name}</span>
            <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}><Trash className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <Input
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[200px]"
          />
          <Button onClick={handleSaveEdit}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileExplorer;