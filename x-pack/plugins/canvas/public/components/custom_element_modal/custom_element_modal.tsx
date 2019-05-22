/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable react/forbid-elements */
import React, { PureComponent } from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  // @ts-ignore hasn't been converted to TypeScript yet
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiSpacer,
  EuiText,
  EuiTextArea,
  EuiTitle,
} from '@elastic/eui';
// @ts-ignore converting /libs/constants to TS breaks CI
import { VALID_IMAGE_TYPES } from '../../../common/lib/constants';
import { encode } from '../../../common/lib/dataurl';
import { ElementCard } from '../element_card';

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 100;

interface Props {
  /**
   * initial value of the name of the custom element
   */
  name?: string;
  /**
   * initial value of the description of the custom element
   */
  description?: string;
  /**
   * initial value of the preview image of the custom element as a base64 dataurl
   */
  image?: string;
  /**
   * title of the modal
   */
  title: string;
  /**
   * A click handler for the save button
   */
  onSave: (name: string, description: string, image: string) => void;
  /**
   * A click handler for the cancel button
   */
  onCancel: () => void;
}

interface State {
  /**
   * name of the custom element to be saved
   */
  name?: string;
  /**
   * description of the custom element to be saved
   */
  description?: string;
  /**
   * image of the custom element to be saved
   */
  image?: string;
}

export class CustomElementModal extends PureComponent<Props, State> {
  public static propTypes = {
    name: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  public state = {
    name: this.props.name || '',
    description: this.props.description || '',
    image: this.props.image || '',
  };

  private _handleChange = (type: 'name' | 'description' | 'image', value: string) => {
    this.setState({ [type]: value });
  };

  private _handleUpload = (files: File[]) => {
    const [file] = files;
    const [type, subtype] = get(file, 'type', '').split('/');
    if (type === 'image' && VALID_IMAGE_TYPES.indexOf(subtype) >= 0) {
      encode(file).then((dataurl: string) => this._handleChange('image', dataurl));
    }
  };

  public render() {
    const { onSave, onCancel, title, ...rest } = this.props;
    const { name, description, image } = this.state;

    return (
      <EuiModal
        {...rest}
        className={`canvasCustomElementModal`}
        maxWidth={700}
        onClose={onCancel}
        initialFocus=".canvasCustomElementForm__name"
      >
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h3>{title}</h3>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="flexStart">
            <EuiFlexItem className="canvasCustomElementForm" grow={2}>
              <EuiFormRow
                label="Name"
                helpText={`${MAX_NAME_LENGTH - name.length} characters remaining`}
                compressed
              >
                <EuiFieldText
                  value={name}
                  className="canvasCustomElementForm__name"
                  onChange={e =>
                    e.target.value.length <= MAX_NAME_LENGTH &&
                    this._handleChange('name', e.target.value)
                  }
                  required
                />
              </EuiFormRow>
              <EuiFormRow
                label="Description"
                helpText={`${MAX_DESCRIPTION_LENGTH - description.length} characters remaining`}
              >
                <EuiTextArea
                  value={description}
                  rows={2}
                  onChange={e =>
                    e.target.value.length <= MAX_DESCRIPTION_LENGTH &&
                    this._handleChange('description', e.target.value)
                  }
                />
              </EuiFormRow>
              <EuiFormRow
                className="canvasCustomElementForm__thumbnail"
                label="Thumbnail image"
                compressed
              >
                <EuiFilePicker
                  initialPromptText="Select or drag and drop an image"
                  onChange={this._handleUpload}
                  className="canvasImageUpload"
                  accept="image/*"
                />
              </EuiFormRow>
              <EuiText className="canvasCustomElementForm__thumbnailHelp" size="xs">
                <p>
                  Take a screenshot of your element and upload it here. This can also be done after
                  saving.
                </p>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem
              className="canvasElementCard__wrapper canvasCustomElementForm__preview"
              grow={1}
            >
              <EuiTitle size="xxxs">
                <h4>Element preview</h4>
              </EuiTitle>
              <EuiSpacer size="s" />
              <ElementCard title={name} description={description} image={image} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={onCancel}>Cancel</EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                onClick={() => {
                  onSave(name, description, image);
                }}
              >
                Save
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModalFooter>
      </EuiModal>
    );
  }
}
