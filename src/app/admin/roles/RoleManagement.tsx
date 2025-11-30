'use client'
import { useState, useEffect } from 'react';
import { UserProps } from '@/lib/db/model/types/User.types';
import { RoleProps } from '@/lib/db/model/types/Role.types';
import { SubjectProps } from '@/lib/db/model/types/Subject.types';
import { UserRoleProps } from '@/lib/db/model/types/UserRole.types';

interface RoleManagementProps {
  usersData: string;
  rolesData: string;
  subjectsData: string;
}

export default function RoleManagement({
  usersData,
  rolesData,
  subjectsData
}: RoleManagementProps) {
  const users: UserProps[] = JSON.parse(usersData);
  const roles: RoleProps[] = JSON.parse(rolesData);
  const subjects: SubjectProps[] = JSON.parse(subjectsData);

  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [userRoles, setUserRoles] = useState<UserRoleProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load user roles when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadUserRoles(selectedUser);
    }
  }, [selectedUser]);

  const loadUserRoles = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/user-roles?userId=${userId}`);
      const data = await response.json();
      setUserRoles(data.userRoles || []);
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      setMessage('Please select both user and role');
      return;
    }

    const selectedRoleData = roles.find(r => r._id.toString() === selectedRole);
    if (!selectedRoleData) return;

    // Check if role requires subject scope
    if (!selectedRoleData.isGlobal && !selectedSubject) {
      setMessage('This role requires a subject selection');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/user-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          roleId: selectedRole,
          subjectId: selectedRoleData.isGlobal ? null : selectedSubject
        })
      });

      if (response.ok) {
        setMessage('Role assigned successfully');
        loadUserRoles(selectedUser);
        setSelectedRole('');
        setSelectedSubject('');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Failed to assign role');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (userRoleId: string) => {
    if (!confirm('Are you sure you want to remove this role?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/user-roles?id=${userRoleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Role removed successfully');
        loadUserRoles(selectedUser);
      } else {
        setMessage('Failed to remove role');
      }
    } catch (error) {
      setMessage('Failed to remove role');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleData = roles.find(r => r._id.toString() === selectedRole);

  return (
    <div className="space-y-8">
      {/* Assignment Form */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Assign Role</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select User</label>
            <select
              className="w-full p-2 border rounded-lg bg-background"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">-- Select User --</option>
              {users.map(user => (
                <option key={user._id.toString()} value={user._id.toString()}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Role</label>
            <select
              className="w-full p-2 border rounded-lg bg-background"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">-- Select Role --</option>
              {roles.map(role => (
                <option key={role._id.toString()} value={role._id.toString()}>
                  {role.displayName} {role.isGlobal ? '(Global)' : '(Subject-scoped)'}
                </option>
              ))}
            </select>
          </div>

          {selectedRoleData && !selectedRoleData.isGlobal && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Select Subject</label>
              <select
                className="w-full p-2 border rounded-lg bg-background"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(subject => (
                  <option key={subject._id?.toString()} value={subject._id?.toString()}>
                    {subject.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleAssignRole}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Assigning...' : 'Assign Role'}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-lg ${message.includes('Error') ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Current Roles */}
      {selectedUser && (
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">
            Current Roles for {users.find(u => u._id.toString() === selectedUser)?.name}
          </h2>

          {userRoles.length === 0 ? (
            <p className="text-muted-foreground">No roles assigned</p>
          ) : (
            <div className="space-y-2">
              {userRoles.map((userRole: any) => (
                <div
                  key={userRole._id.toString()}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <span className="font-medium">{userRole.roleId?.displayName || 'Unknown Role'}</span>
                    {userRole.subjectId && (
                      <span className="text-sm text-muted-foreground ml-2">
                        → {userRole.subjectId?.title || 'Unknown Subject'}
                      </span>
                    )}
                    {!userRole.subjectId && (
                      <span className="text-sm text-muted-foreground ml-2">(Global)</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveRole(userRole._id.toString())}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Role Definitions */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Role Definitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(role => (
            <div key={role._id.toString()} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{role.displayName}</h3>
              <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
              <div className="mt-2">
                <span className="text-xs font-medium">Permissions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {role.permissions.map(perm => (
                    <span
                      key={perm}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
