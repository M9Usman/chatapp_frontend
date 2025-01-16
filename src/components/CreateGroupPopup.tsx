import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

type User = {
  id: number;
  name: string;
  email: string;
};

interface CreateGroupPopupProps {
  users: User[];
  onClose: () => void;
  onCreateGroup: (group: { name: string; participants: number[] }) => void;
}

export function CreateGroupPopup({ users, onClose, onCreateGroup }: CreateGroupPopupProps) {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => 
      prev.some(u => u.id === user.id) 
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = () => {
    if (groupName && selectedUsers.length > 0) {
      onCreateGroup({
        name: groupName,
        participants: selectedUsers.map(u => u.id),
      });
      onClose();
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-gray-900 text-white">
        <CardHeader className="flex justify-between items-center relative">
          <CardTitle>Create Group With Friend</CardTitle>
          <Button variant="ghost" className="absolute top-0 right-1 bg-gray-100 text-red-500 hover:bg-red-500 hover:text-white transition " size="icon" onClick={onClose}>
            <X className="h-8 w-8" />
          </Button>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mb-4"
          />
          <div
            className="h-[1px] bg-[gray] mb-3"
          ></div>
          <Input
            placeholder="Search Users"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-60 mb-4">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className={`flex items-center p-2 cursor-pointer rounded-md mb-2 ${
                  selectedUsers.some(u => u.id === user.id) ? 'bg-white text-black hover:bg-red-500' : 'hover:bg-gray-800'
                }`}
                onClick={() => handleSelectUser(user)}
              >
                {user.name}
              </div>
            ))}
          </ScrollArea>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedUsers.map(user => (
              <div
                key={user.id}
                className="bg-red-600 text-white px-2 py-1 rounded-full flex items-center"
              >
                {user.name}
                <X
                  className="h-4 w-4 ml-2 cursor-pointer"
                  onClick={() => handleSelectUser(user)}
                />
              </div>
            ))}
          </div>
          <Button onClick={handleCreateGroup} className="w-full bg-white text-black border uppercase border-black hover:text-white hover:bg-black hover:border-none">
            Create Group
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
