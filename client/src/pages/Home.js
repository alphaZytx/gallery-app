import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Navbar from '../components/Navbar';
import ImageModal from '../components/ImageModal';
import api from '../api/axios';

const GalleryContainer = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 20px auto;
`;

const GalleryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
`;

const GalleryItem = styled.div`
    background-color: ${(props) => props.theme.cardBackground};
    border-radius: 8px;
    box-shadow: ${(props) => props.theme.boxShadow};
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-5px);
    }

    img, video {
        width: 100%;
        height: 200px;
        object-fit: cover;
        display: block;
    }

    .item-info {
        padding: 15px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        h3 {
            font-size: 1.1rem;
            margin-bottom: 5px;
            color: ${(props) => props.theme.text};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        p {
            font-size: 0.85rem;
            color: ${(props) => props.theme.secondary};
        }
    }
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap: 10px;

    button {
        background-color: ${(props) => props.theme.primary};
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        &:disabled {
            background-color: ${(props) => props.theme.secondary};
            cursor: not-allowed;
            opacity: 0.6;
        }
    }
`;

const LoadingText = styled.p`
    text-align: center;
    margin-top: 50px;
    font-size: 1.2rem;
    color: ${(props) => props.theme.text};
`;

const ErrorText = styled.p`
    text-align: center;
    margin-top: 50px;
    font-size: 1.2rem;
    color: red;
`;

const NoImagesText = styled(LoadingText)`
    color: ${(props) => props.theme.secondary};
`;

const Home = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12; // Matches backend default limit

    useEffect(() => {
        const fetchImages = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/public/images?page=${currentPage}&limit=${itemsPerPage}`);
                // CORRECTED: Access data from response.data
                setMedia(response.data.media);
                setCurrentPage(response.data.currentPage);
                setTotalPages(response.data.totalPages);
            } catch (err) {
                console.error('Error fetching public images:', err);
                setError('Failed to load images. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [currentPage]);

    const handleItemClick = (item) => {
        setSelectedMedia(item);
    };

    const handleCloseModal = () => {
        setSelectedMedia(null);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    return (
        <>
            <Navbar />
            <GalleryContainer>
                {loading && <LoadingText>Loading gallery...</LoadingText>}
                {error && <ErrorText>{error}</ErrorText>}
                {!loading && !error && media.length === 0 && (
                    <NoImagesText>No images to display. Check back later!</NoImagesText>
                )}
                {!loading && !error && media.length > 0 && (
                    <>
                        <GalleryGrid>
                            {media.map((item) => (
                                <GalleryItem key={item.id} onClick={() => handleItemClick(item)}>
                                    {item.type === 'image' ? (
                                        <img src={item.url} alt={item.name} loading="lazy" onError={(e) => { e.target.src = 'https://placehold.co/400x300/FF0000/FFFFFF?text=Error'; }} />
                                    ) : (
                                        <video src={item.url} controls muted preload="metadata" onError={(e) => { e.target.src = 'https://placehold.co/400x300/FF0000/FFFFFF?text=Error'; }} />
                                    )}
                                    <div className="item-info">
                                        <h3>{item.name}</h3>
                                        <p>{item.tags && item.tags.length > 0 ? `Tags: ${item.tags.join(', ')}` : 'No tags'}</p>
                                    </div>
                                </GalleryItem>
                            ))}
                        </GalleryGrid>
                        <Pagination>
                            <button onClick={handlePrevPage} disabled={currentPage === 1}>
                                Previous
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                                Next
                            </button>
                        </Pagination>
                    </>
                )}
            </GalleryContainer>
            {selectedMedia && <ImageModal media={selectedMedia} onClose={handleCloseModal} />}
        </>
    );
};

export default Home;