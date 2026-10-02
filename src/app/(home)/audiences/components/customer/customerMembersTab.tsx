'use client';

import React from 'react';
import { GenericMembersList } from '../common/genericMembersList';
import { customerStrategy } from './customerStrategy';

export const CustomerMembersTab: React.FC = () => {
    return <GenericMembersList strategy={customerStrategy} />;
};

export default CustomerMembersTab;
