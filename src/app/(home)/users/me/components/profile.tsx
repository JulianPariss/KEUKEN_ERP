'use client';

import { useAuth } from '@/contexts/AuthContext';
import Form, { GroupItem, Label, SimpleItem } from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';

// Activity Item Renderer — hoisted outside component to avoid recreation on each render
const ActivityItem = (item: any) => {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start group py-2">
            <span className="font-medium group-hover:text-focus-500 transition-colors cursor-default">
                {item.action}
            </span>
            <span className="text-xs text-focus-300 bg-primary-900 px-2 py-1 rounded-dx whitespace-nowrap ml-2">
                {item.date}
            </span>
        </div>
    );
};

export default function Profile() {
    const { user } = useAuth();

    if (!user) return null;

    // Adapt real user fields for the form
    const formData = {
        name: user.name ?? '',
        login: user.login ?? '',
        roles: user.roles?.join(', ') ?? '',
        status: user.active ? 'Activo' : 'Inactivo',
    };

    const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <ScrollView className="w-full h-full overflow-hidden" showScrollbar="always">
            <div className="w-full h-full grid grid-cols-1 gap-4 max-w-6xl mx-auto">
                {/* Row 1: Profile Summary (Banner) */}
                <div className="bg-primary-500 rounded-dx shadow-sm p-8 flex flex-col md:flex-row items-center gap-10">
                    {/* Left side: Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-focus-100 to-focus-500 flex items-center justify-center text-5xl font-extrabold shadow-xl ring-4 ring-primary-900">
                            {initials}
                        </div>
                    </div>

                    {/* Right side: Profile Info Form */}
                    <div className="flex-1 w-full">
                        <Form formData={formData} readOnly={true} labelLocation="top">
                            <GroupItem colCount={2}>
                                <SimpleItem dataField="name" editorOptions={{ stylingMode: 'filled' }}>
                                    <Label text="Nombre Completo" />
                                </SimpleItem>
                                <SimpleItem dataField="login" editorOptions={{ stylingMode: 'filled' }}>
                                    <Label text="Usuario (Login)" />
                                </SimpleItem>
                                <SimpleItem dataField="roles" editorOptions={{ stylingMode: 'filled' }}>
                                    <Label text="Roles" />
                                </SimpleItem>
                                <SimpleItem dataField="status" editorOptions={{ stylingMode: 'filled' }}>
                                    <Label text="Estado" />
                                </SimpleItem>
                            </GroupItem>
                        </Form>
                    </div>
                </div>
            </div>
        </ScrollView>
    );
}