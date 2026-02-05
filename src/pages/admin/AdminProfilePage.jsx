import { getSession } from '../../store/sessionStore.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { User, Mail, Building, Shield, Save } from 'lucide-react';

export function AdminProfilePage() {
  const session = getSession();

  if (!session) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Management"
        description="Manage your admin profile and account settings"
        icon={User}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {session.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-600">Update your personal information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={session.name?.split(' ')[0] || ''}
                placeholder="Enter first name"
                leftIcon={User}
                disabled
              />
              <Input
                label="Last Name"
                value={session.name?.split(' ').slice(1).join(' ') || ''}
                placeholder="Enter last name"
                leftIcon={User}
                disabled
              />
            </div>

            <Input
              label="Email Address"
              value={session.email || ''}
              placeholder="Enter email address"
              leftIcon={Mail}
              disabled
            />

            <Input
              label="Role"
              value="Administrator"
              leftIcon={Shield}
              disabled
            />

            <Input
              label="Department"
              value="Administration"
              leftIcon={Building}
              disabled
            />

            <div className="pt-4">
              <Button variant="primary" className="w-full" disabled>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Profile editing is disabled in demo mode
              </p>
            </div>
          </div>
        </Card>

        {/* Account Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
              <p className="text-sm text-gray-600">Manage your account preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Administrator Access</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You have full administrative privileges including user management, project oversight, and system configuration.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Organization</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Project Management Enterprise - Admin Workspace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}