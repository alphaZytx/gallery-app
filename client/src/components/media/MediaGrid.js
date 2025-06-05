// client/src/components/media/MediaGrid.js
import React from 'react';
import styled from 'styled-components';
import MediaCard from './MediaCard';
import AdminMediaCard from '../admin/AdminMediaCard';
import Spinner from '../common/Spinner';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.xs}) {
    grid-template-columns: 1fr; /* Single column for very small screens */
    gap: 1rem;
  }
`;

const MessageContainer = styled.div`
  text-align: center;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.secondary};
  padding: 3rem 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* Ensure it takes some space */
`;

const MediaGrid = ({ items, isAdmin = false, isLoading, onCardClick, onEdit, onDelete }) => {
  if (isLoading) {
    return <Spinner containerPadding="4rem 0" size="50px" />;
  }

  const validItems = Array.isArray(items) ? items.filter(item => item && typeof item === 'object' && item.id) : [];

  if (validItems.length === 0) {
    return (
        <MessageContainer>
            {isAdmin ? "No media items found in the dashboard." : "No images found in the gallery yet. 🖼️"}
        </MessageContainer>
    );
  }

  return (
    <GridContainer>
      {validItems.map((item) =>
        isAdmin ? (
          <AdminMediaCard
            key={item.id}
            mediaItem={item}
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item.id, item.name)}
          />
        ) : (
          <MediaCard
            key={item.id}
            mediaItem={item}
            onClick={() => onCardClick(item)}
          />
        )
      )}
    </GridContainer>
  );
};

export default MediaGrid;