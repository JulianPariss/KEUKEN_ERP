'use client';

import React from 'react';
import { GenericMembersList } from '../common/genericMembersList';
import { itemStrategy } from './itemStrategy';

export const ItemMembersTab: React.FC = () => {
    return <GenericMembersList strategy={itemStrategy} />;
};

export default ItemMembersTab;
