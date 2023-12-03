import React, { useState, useEffect, useCallback } from 'react';
import Searchbar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import Loader from './Loader/Loader';
import Modal from './Modal/Modal';
import styles from './App.module.css';

export const App = () => {
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [totalHits, setTotalHits] = useState(0);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    const API_KEY = '40897578-245d0fcba4e598e8b9a6aae4d';
    const url = `https://pixabay.com/api/?q=${encodeURIComponent(
      searchTerm
    )}&page=${currentPage}&key=${API_KEY}&image_type=photo&orientation=horizontal&per_page=12`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setImages(prev => [...prev, ...data.hits]);
      setTotalHits(data.totalHits);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
      if (currentPage > 1) {
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    if (searchTerm) {
      fetchImages();
    }
  }, [fetchImages, searchTerm]);

  const handleSearchSubmit = searchValue => {
    if (searchValue.trim() !== '' && searchValue !== searchTerm) {
      setImages([]);
      setCurrentPage(1);
      setSearchTerm(searchValue);
    }
  };

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const openModal = image => {
    setModalImage(image);
  };

  const closeModal = useCallback(() => {
    setModalImage(null);
  }, []);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className={styles.container}>
      <Searchbar onSubmit={handleSearchSubmit} />
      <ImageGallery images={images} onImageClick={openModal} />
      {isLoading && <Loader />}
      {images.length > 0 && images.length < totalHits && !isLoading ? (
        <Button onClick={loadMore} />
      ) : null}
      {images.length > 0 && images.length >= totalHits && !isLoading ? (
        <p className={styles.noMoreResults}>No more results</p>
      ) : null}
      {modalImage && (
        <Modal largeImageURL={modalImage.largeImageURL} onClose={closeModal} />
      )}
    </div>
  );
};
