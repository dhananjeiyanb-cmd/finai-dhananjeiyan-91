
import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Settings, LogOut, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  tenant_id: string;
}

interface ProfileDropdownProps {
  user: User | null;
  onSignOut: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setFullName(data.full_name || '');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      toast({ title: "Avatar updated successfully!" });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: "Error uploading avatar", variant: "destructive" });
    }
    setIsUploading(false);
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
      
      if (avatarFile) {
        await handleAvatarUpload(avatarFile);
      }

      setIsProfileDialogOpen(false);
      toast({ title: "Profile updated successfully!" });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: "Error updating profile", variant: "destructive" });
    }
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="flex items-center space-x-4">
      {profile?.tenant_id && (
        <div className="hidden sm:block text-sm text-muted-foreground">
          ID: <span className="font-mono font-medium">{profile.tenant_id}</span>
        </div>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-background border-border z-50" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              {profile?.tenant_id && (
                <p className="text-xs leading-none text-muted-foreground font-mono">
                  ID: {profile.tenant_id}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-background border-border">
              <DialogHeader>
                <DialogTitle>Profile Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80">
                        <Upload className="h-4 w-4" />
                        <span>Upload Avatar</span>
                      </div>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarFile(file);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label>Tenant ID</Label>
                  <Input 
                    value={profile?.tenant_id || ''} 
                    disabled 
                    className="bg-muted font-mono" 
                  />
                </div>

                <Button 
                  onClick={handleProfileUpdate} 
                  className="w-full" 
                  disabled={isUploading}
                >
                  {isUploading ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileDropdown;
