import Immutable from 'immutable';
import { CompositeDecorator } from 'draft-js';
import React from 'react'

/**
 * Block Map.
 */
export const CustomBlockMap = Immutable.Map({
  section: {
    element: 'h1',
  },
  chapter: {
    element: 'h2',
  },
  scene: {
    element: 'h3',
  },
  dialogue: {
    element: 'section',
  },
  normal: {
    element: 'section',
  },
  unstyled: {
    element: 'section',
  },
});

/**
 * Block Style Map.
 */
export const CustomBlockStyleMap = block => {
  let type = block.getData().get('text_align');

  if (type === 'text-left') {
    return 'text-left';
  }

  if (type === 'text-right') {
    return 'text-right';
  }

  if (type === 'text-center') {
    return 'text-center';
  }

  if (type === 'text-justify') {
    return 'text-justify';
  }
};

/**
 * Decorator Lists.
 */
export const DecoratorLists = () => {
  let Link = props => {
    let { url } = props.contentState.getEntity(props.entityKey).getData();
    return <a href={url}>{props.children}</a>;
  };

  let findLinkEntities = (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(character => {
      let entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    }, callback);
  };

  let Sentence = props => {
    let { type } = props.contentState.getEntity(props.entityKey).getData();
    return <span className={`sentence-${type}`}>{props.children}</span>;
  };

  let findSentenceEntities = (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(character => {
      let entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'SENTENCE'
      );
    }, callback);
  };

  return new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: Link,
    },
    {
      strategy: findSentenceEntities,
      component: Sentence,
    },
  ]);
};

/**
 * Style Map.
 */
export const CustomStyleMap = {
  LINK: {
    color: '#00bfff',
  },
  SPELL: {
    backgroundColor: 'rgb(255, 219, 227)',
    borderBottom: '3px solid rgb(234, 21, 55)',
  },
  FIND: {
    backgroundColor: '#fab712',
  },
};
