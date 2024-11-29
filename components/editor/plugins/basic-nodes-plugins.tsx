'use client'

import {
  BasicMarksPlugin,
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react'
import { BlockquotePlugin } from '@udecode/plate-block-quote/react'
import { CodeBlockPlugin } from '@udecode/plate-code-block/react'
import { HeadingPlugin } from '@udecode/plate-heading/react'
import Prism from 'prismjs'

export const basicNodesPlugins = [
  HeadingPlugin.configure({ options: { levels: 3 } }),
  BlockquotePlugin,
  CodeBlockPlugin.configure({ options: { prism: Prism } }),
  // BasicMarksPlugin,
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  // SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
] as const
