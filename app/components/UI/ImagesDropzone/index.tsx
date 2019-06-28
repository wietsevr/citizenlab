import React, { PureComponent } from 'react';
import Dropzone from 'react-dropzone';
import { size, compact, isEmpty } from 'lodash-es';

// components
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import Error from 'components/UI/Error';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import shallowCompare from 'utils/shallowCompare';
import { getBase64FromFile, createObjectUrl, revokeObjectURL } from 'utils/imageTools';

// style
import styled, { css } from 'styled-components';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { UploadFile } from 'typings';

const Container = styled.div`
  width: 100%;
  display: column;
`;

const ContentWrapper: any = styled(TransitionGroup)`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;

const ErrorWrapper = styled.div`
  flex: 1;
  margin-top: -12px;
`;

const DropzonePlaceholderText = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;
  text-align: center;
  width: 100%;
  transition: all 100ms ease-out;
`;

const DropzonePlaceholderIcon = styled(Icon)`
  height: 32px;
  fill: ${colors.label};
  margin-bottom: 5px;
  transition: all 100ms ease-out;
`;

const DropzoneImagesRemaining = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 18px;
  font-weight: 400;
  text-align: center;
  margin-top: 6px;
  transition: all 100ms ease-out;
`;

const DropzoneContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const StyledDropzone = styled(Dropzone)`
  box-sizing: border-box;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px dashed ${colors.label};
  position: relative;
  cursor: pointer;
  background: transparent;
  transition: all 100ms ease-out;

  &.rounded {
    border-radius: 50%;
  }

  ${(props: any) => props.disabled ? css`
    cursor: not-allowed;
    border-color: #ccc;
    cursor: no-drop !important;

    ${DropzonePlaceholderText},
    ${DropzoneImagesRemaining} {
      color: #ccc;
    }

    ${DropzonePlaceholderIcon} {
      fill: #ccc;
    }
  ` : css`
    cursor: pointer !important;

    &:hover {
      border-color: #000;

      ${DropzonePlaceholderText},
      ${DropzoneImagesRemaining} {
        color: #000;
      }

      ${DropzonePlaceholderIcon} {
        fill: #000;
      }
    }
  `}
`;

const Image: any = styled.div`
  background-repeat: no-repeat;
  background-position: center center;
  background-size: ${(props: any) => props.objectFit};
  background-image: url(${(props: any) => props.src});
  position: relative;
  box-sizing: border-box;
  border-radius: ${(props: any) => props.imageRadius ? props.imageRadius : props.theme.borderRadius};
  border: solid 1px #ccc;
`;

const Box: any = styled.div`
  width: 100%;
  max-width: ${(props: any) => props.maxWidth ? props.maxWidth : '100%'};
  margin-bottom: 16px;
  position: relative;

  &.hasSpacing {
    margin-right: 20px;
  }

  ${Image},
  ${StyledDropzone} {
    width: 100%;
    height: 100%;
    height: ${(props: any) => props.ratio !== 1 ? 'auto' : props.maxWidth};
    padding-bottom: ${(props: any) => props.ratio !== 1 ? `${Math.round(props.ratio * 100)}%` : '0'};
  }

  &.animate {
    &.image-enter {
      opacity: 0;
      width: 0px;
      transition: all 300ms cubic-bezier(0.165, 0.84, 0.44, 1) 2000ms;

      &.hasSpacing {
        margin-right: 0px;
      }

      &.image-enter-active {
        opacity: 1;
        width: 100%;

        &.hasSpacing {
          margin-right: 20px;
        }
      }
    }

    &.image-exit {
      opacity: 1;
      width: 100%;
      transition: all 250ms ease-out;

      &.hasSpacing {
        margin-right: 20px;
      }

      &.image-exit-active {
        opacity: 0;
        width: 0px;

        &.hasSpacing {
          margin-right: 0px;
        }
      }
    }
  }
`;

const RemoveIcon = styled(Icon)`
  height: 10px;
  fill: #fff;
  transition: all 100ms ease-out;
`;

const RemoveButton: any = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 0;
  cursor: pointer;
  border-radius: 50%;
  border: solid 1px transparent;
  background: rgba(0, 0, 0, 0.6);
  transition: all 100ms ease-out;

  &:hover {
    background: #000;
    border-color: #fff;

    ${RemoveIcon} {
      fill: #fff;
    }
  }
`;

interface Props {
  id?: string | undefined;
  images: UploadFile[] | null;
  acceptedFileTypes?: string | null | undefined;
  imagePreviewRatio?: number;
  maxImagePreviewWidth?: string;
  maxImageFileSize?: number;
  maxNumberOfImages?: number;
  placeholder?: string | JSX.Element | null | undefined;
  errorMessage?: string | null | undefined;
  objectFit?: 'cover' | 'contain' | undefined;
  onAdd: (arg: UploadFile) => void;
  onRemove: (arg: UploadFile) => void;
  imageRadius?: string;
}

interface State {
  images: UploadFile[] | null;
  errorMessage: string | null;
  processing: boolean;
  canAnimate: boolean;
  canAnimateTimeout: any;
}

class ImagesDropzone extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      errorMessage: null,
      processing: false,
      canAnimate: false,
      canAnimateTimeout: null
    };
  }

  async componentDidMount() {
    const images = await this.getImageFiles(this.props.images);
    this.setState({ images });
  }

  componentWillUnmount() {
    this.revokeObjectUrls(this.state.images);
  }

  async componentDidUpdate(prevProps: Props) {
    if (!shallowCompare(prevProps, this.props)) {
      let images = this.state.images;

      if (this.props.images !== this.state.images) {
        this.revokeObjectUrls(this.state.images);
        images = await this.getImageFiles(this.props.images);
      }

      const errorMessage = (this.props.errorMessage && this.props.errorMessage !== this.state.errorMessage ? this.props.errorMessage : this.state.errorMessage);
      const processing = (this.state.canAnimate && !errorMessage && size(images) > size(this.state.images));

      if (processing) {
        setTimeout(() => this.setState({ processing: false }), 1800);
      }

      this.setState({
        images,
        errorMessage,
        processing
      });
    }
  }

  getImageFiles = async (images: UploadFile[] | null) => {
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i += 1) {
        if (!images[i].base64) {
          try {
            images[i].base64 = await getBase64FromFile(images[i]);
          } catch (error) {
            console.log(error);
          }
        }

        if (!images[i].url) {
          images[i].url = createObjectUrl(images[i]);
        }
      }
    }

    return images;
  }

  revokeObjectUrls = (images: UploadFile[] | null) => {
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i += 1) {
        if (images[i].url && images[i].url.startsWith('blob:')) {
          revokeObjectURL(images[i].url);
        }
      }
    }
  }

  onDrop = async (images: UploadFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxItemsCount = this.props.maxNumberOfImages;
    const oldItemsCount = size(this.props.images);
    const newItemsCount = size(images);
    const remainingItemsCount = (maxItemsCount ? maxItemsCount - oldItemsCount : null);

    this.setState((state: State) => {
      if (state.canAnimateTimeout !== null) {
        clearTimeout(state.canAnimateTimeout);
      }

      return {
        errorMessage: null,
        canAnimate: true,
        canAnimateTimeout: setTimeout(() => this.setState({ canAnimate: false, canAnimateTimeout: null }), 5000)
      };
    });

    if (maxItemsCount && remainingItemsCount && newItemsCount > remainingItemsCount) {
      const errorMessage = (maxItemsCount === 1 ? formatMessage(messages.onlyOneImage) : formatMessage(messages.onlyXImages, { maxItemsCount }));
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    } else {
      const imagesWithPreviews = await this.getImageFiles(images);

      if (imagesWithPreviews && imagesWithPreviews.length > 0) {
        imagesWithPreviews.forEach(image => this.props.onAdd(image));
      }
    }
  }

  onDropRejected = (images: UploadFile[]) => {
    const { formatMessage } = this.props.intl;
    const maxSize = this.props.maxImageFileSize || 5000000;

    if (images.some(image => image.size > maxSize)) {
      const maxSizeExceededErrorMessage = (images.length === 1 || this.props.maxNumberOfImages === 1 ? messages.errorImageMaxSizeExceeded : messages.errorImagesMaxSizeExceeded);
      const errorMessage = formatMessage(maxSizeExceededErrorMessage, { maxFileSize: maxSize / 1000000 });
      this.setState({ errorMessage });
      setTimeout(() => this.setState({ errorMessage: null }), 6000);
    }
  }

  removeImage = (removedImage: UploadFile) => (event: React.FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();

    this.setState((state: State) => {
      if (state.canAnimateTimeout !== null) {
        clearTimeout(state.canAnimateTimeout);
      }

      return {
        canAnimate: true,
        canAnimateTimeout: setTimeout(() => this.setState({ canAnimate: false, canAnimateTimeout: null }), 1000)
      };
    });

    setTimeout(() => this.props.onRemove(removedImage), 50);

    if (removedImage && removedImage['objectUrl']) {
      revokeObjectURL(removedImage['objectUrl']);
    }
  }

  render() {
    let { acceptedFileTypes, placeholder, objectFit } = this.props;
    let { images } = this.state;
    const className = this.props['className'];
    const { maxImageFileSize,
            maxNumberOfImages,
            maxImagePreviewWidth,
            imagePreviewRatio,
            imageRadius } = this.props;
    const { formatMessage } = this.props.intl;
    const { errorMessage, processing, canAnimate } = this.state;
    const remainingImages = (maxNumberOfImages && maxNumberOfImages !== 1 ? `(${maxNumberOfImages - size(images)} ${formatMessage(messages.remaining)})` : null);

    images = (compact(images) || null);
    acceptedFileTypes = (acceptedFileTypes || '*');
    placeholder = (placeholder || (maxNumberOfImages && maxNumberOfImages === 1 ? formatMessage(messages.dropYourImageHere) : formatMessage(messages.dropYourImagesHere)));
    objectFit = (objectFit || 'cover');

    const imageList = ((images && images.length > 0 && (maxNumberOfImages !== 1 || (maxNumberOfImages === 1 && !processing))) ? (
      images.map((image, index) => {
        const hasSpacing = (maxNumberOfImages !== 1 && index !== 0 ? 'hasSpacing' : '');
        const animate = (canAnimate && maxNumberOfImages !== 1 ? 'animate' : '');
        const timeout = !isEmpty(animate) ? { enter: 2300, exit: 300 } : 0;
        const enter = !isEmpty(animate);
        const exit = !isEmpty(animate);

        return (
          <CSSTransition key={image.url} classNames="image" timeout={timeout} enter={enter} exit={exit}>
            <Box
              key={index}
              maxWidth={maxImagePreviewWidth}
              ratio={imagePreviewRatio}
              className={`${hasSpacing} ${animate}`}
            >
              <Image imageRadius={imageRadius} src={image.url} objectFit={objectFit}>
                <RemoveButton onClick={this.removeImage(image)} className="remove-button">
                  <RemoveIcon name="close2" />
                </RemoveButton>
              </Image>
            </Box>
          </CSSTransition>
        );
      }).reverse()
    ) : null);

    const imageDropzone = (
      processing ||
      (maxNumberOfImages && maxNumberOfImages > 1) ||
      (maxNumberOfImages && maxNumberOfImages === 1 && (!images || images.length < 1))
    ) ? (
      <CSSTransition classNames="image" timeout={0} enter={false} exit={false}>
        <Box
          maxWidth={maxImagePreviewWidth}
          ratio={imagePreviewRatio}
          className={(maxNumberOfImages !== 1 && images && images.length > 0 ? 'hasSpacing' : '')}
        >
          <StyledDropzone
            className={`${this.props.imageRadius === '50%' && 'rounded'}`}
            accept={acceptedFileTypes}
            maxSize={maxImageFileSize}
            disabled={processing || maxNumberOfImages === images.length}
            disablePreview={true}
            onDrop={this.onDrop}
            onDropRejected={this.onDropRejected}
          >
            {!processing ? (
              <DropzoneContent>
                <DropzonePlaceholderIcon name="upload" />
                <DropzonePlaceholderText>{placeholder}</DropzonePlaceholderText>
                <DropzoneImagesRemaining>{remainingImages}</DropzoneImagesRemaining>
              </DropzoneContent>
            ) : (
              <DropzoneContent>
                <Spinner />
              </DropzoneContent>
            )}
          </StyledDropzone>
        </Box>
      </CSSTransition>
    ) : null;

    return (
      <Container className={className}>
        <ContentWrapper>
          {imageDropzone}
          {imageList}
        </ContentWrapper>

        <ErrorWrapper>
          <Error text={errorMessage} />
        </ErrorWrapper>
      </Container>
    );
  }
}

export default injectIntl<Props>(ImagesDropzone);