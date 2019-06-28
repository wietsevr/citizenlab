import React, { PureComponent } from 'react';
import styled from 'styled-components';
import GetTenant from 'resources/GetTenant';
import { isNilOrError } from 'utils/helperUtils';

const StyledIframe = styled.iframe`
  border: 0;
  height: ${props => props.height ? `${props.height}px` : 'auto'};
  width: 100%;
`;

type Props = {
  title: string;
  name: string;
  tenantId: string;
};

type State = {
  fragmentExists: boolean;
  iframeHeight?: number;
};

/**
 * Wrap content in a named fragment to allow the content to be overridden
 * for a specific tenant
*/
class Fragment extends PureComponent<Props, State> {

  iframeNode: HTMLIFrameElement;

  constructor(props) {
    super(props);
    this.state = {
      fragmentExists: false
    };
  }

  componentDidMount() {
    fetch(this.fragmentUrl())
    .then((response) => {
      if (response.ok) {
        this.setState({ fragmentExists: true });
      } else {
        throw('not found');
      }
    })
    .catch(() => {
      this.setState({ fragmentExists: false });
    });
  }

  fragmentUrl = () => `/fragments/${this.props.tenantId}/${this.props.name}.html`;

  setIframeRef = (ref) => {
    this.iframeNode = ref;
  }

  setIframeHeight = () => {
    if (this.iframeNode && this.iframeNode.contentWindow) {
      this.setState({
        iframeHeight: this.iframeNode.contentWindow.document.body.scrollHeight * 1.1,
      });
    }
  }

  render() {
    const { children, title } = this.props;
    const { fragmentExists, iframeHeight } = this.state;

    if (fragmentExists) {
      return (
        <StyledIframe
          title={title}
          ref={this.setIframeRef}
          src={this.fragmentUrl()}
          height={iframeHeight}
          onLoad={this.setIframeHeight}
        />
      );
    } else if (fragmentExists === false) {
      return children;
    }

    return null;
  }
}

export default (inputProps) => (
  <GetTenant>
    {(tenant) => !isNilOrError(tenant) ? <Fragment {...inputProps} tenantId={tenant.id} /> : null}
  </GetTenant>
);