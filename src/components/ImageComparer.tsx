import React, {useState, useRef} from 'react';
import styles from './image-comparer.module.scss';
import {ImgComparisonSlider} from "@img-comparison-slider/react";
import {ProgressBar} from "react-loader-spinner";

interface ImageComparerProps {
    image1: string;
    image2?: string | null;
    loading: boolean;
}

function ImageComparer({image1, image2, loading}: ImageComparerProps) {


    return (
        <div className={styles.wrapper}>
            {loading && <div className={styles.loaderOverlay}>
                <ProgressBar
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="progress-bar-loading"
                    wrapperStyle={{}}
                />
            </div>}
            {image2 ? <ImgComparisonSlider>
                <img className={styles.image} slot="first" src={image1}/>
                <img className={styles.image} slot="second" src={image2}/>
            </ImgComparisonSlider> : <img className={styles.image} slot="first" src={image1}/>}

        </div>

    );
}

export default ImageComparer;