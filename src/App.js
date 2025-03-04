import React, { useState, useEffect, createContext, useContext, useRef, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import {jwtDecode as jwt_decode} from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';

// ==============================================
// STYLES
// ==============================================

const styles = `
  /* Variables */
  :root {
    --primary: #1a73e8;
    --primary-light: #e8f0fe;
    --secondary: #6c757d;
    --success: #28a745;
    --danger: #dc3545;
    --warning: #ffc107;
    --info: #17a2b8;
    --dark: #212529;
    --light: #f8f9fa;
    --white: #ffffff;
    --gray-100: #f8f9fa;
    --gray-200: #e9ecef;
    --gray-300: #dee2e6;
    --gray-400: #ced4da;
    --gray-500: #adb5bd;
    --gray-600: #6c757d;
    --gray-700: #495057;
    --gray-800: #343a40;
    --gray-900: #212529;
    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    --font-family-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
    --border-radius: 4px;
    --transition: all 0.2s ease-in-out;
    --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    --box-shadow-lg: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    
    /* Code theme vars */
    --code-bg: #282c34;
    --code-text: #abb2bf;
    --code-keyword: #c678dd;
    --code-function: #61afef;
    --code-string: #98c379;
    --code-number: #d19a66;
    --code-comment: #5c6370;
    --code-operator: #56b6c2;
  }

  /* Dark mode */
  [data-theme="dark"] {
    --primary: #90caf9;
    --primary-light: #1e2738;
    --secondary: #adb5bd;
    --dark: #e9ecef;
    --light: #212529;
    --white: #121212;
    --gray-100: #343a40;
    --gray-200: #495057;
    --gray-300: #6c757d;
    --gray-400: #adb5bd;
    --gray-500: #ced4da;
    --gray-600: #dee2e6;
    --gray-700: #e9ecef;
    --gray-800: #f8f9fa;
    --gray-900: #ffffff;
    
    --code-bg: #1e1e1e;
    --code-text: #d4d4d4;
    --code-keyword: #c586c0;
    --code-function: #dcdcaa;
    --code-string: #ce9178;
    --code-number: #b5cea8;
    --code-comment: #6a9955;
    --code-operator: #569cd6;
  }

  /* Global styles */
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: var(--font-family);
    color: var(--dark);
    background-color: var(--white);
    line-height: 1.6;
    transition: var(--transition);
  }

  a {
    color: var(--primary);
    text-decoration: none;
    transition: var(--transition);
  }

  a:hover {
    color: var(--primary-light);
    text-decoration: underline;
  }

  button {
    cursor: pointer;
    font-family: var(--font-family);
    border-radius: var(--border-radius);
    transition: var(--transition);
    padding: 0.375rem 0.75rem;
    border: 1px solid transparent;
    background-color: var(--primary);
    color: var(--white);
  }

  button:hover {
    opacity: 0.9;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input, textarea, select {
    font-family: var(--font-family);
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    transition: var(--transition);
    background-color: var(--white);
    color: var(--dark);
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 0.2rem rgba(26, 115, 232, 0.25);
  }

  /* Layout */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    border-bottom: 1px solid var(--gray-200);
    background-color: var(--white);
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--dark);
  }

  .navbar-menu {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }

  .navbar-item {
    color: var(--gray-700);
    font-weight: 500;
  }

  .navbar-item:hover {
    color: var(--primary);
  }

  /* Main content */
  .main {
    min-height: calc(100vh - 60px - 80px);
    padding: 2rem 0;
  }

  .footer {
    padding: 1.5rem 0;
    border-top: 1px solid var(--gray-200);
    text-align: center;
    color: var(--gray-600);
  }

  /* Button styles */
  .btn {
    display: inline-block;
    font-weight: 500;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: var(--border-radius);
    transition: var(--transition);
  }

  .btn-primary {
    background-color: var(--primary);
    color: var(--white);
    border: 1px solid var(--primary);
  }

  .btn-outline {
    background-color: transparent;
    border: 1px solid currentColor;
    color: var(--primary);
  }

  .btn-danger {
    background-color: var(--danger);
    color: var(--white);
    border: 1px solid var(--danger);
  }

  .btn-success {
    background-color: var(--success);
    color: var(--white);
    border: 1px solid var(--success);
  }

  .btn-warning {
    background-color: var(--warning);
    color: var(--dark);
    border: 1px solid var(--warning);
  }

  .btn-info {
    background-color: var(--info);
    color: var(--white);
    border: 1px solid var(--info);
  }

  .btn-secondary {
    background-color: var(--secondary);
    color: var(--white);
    border: 1px solid var(--secondary);
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  .btn-lg {
    padding: 0.5rem 1rem;
    font-size: 1.25rem;
  }

  /* Cards */
  .card {
    border-radius: var(--border-radius);
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    overflow: hidden;
    margin-bottom: 1.5rem;
    box-shadow: var(--box-shadow);
    transition: var(--transition);
  }

  .card:hover {
    box-shadow: var(--box-shadow-lg);
    transform: translateY(-2px);
  }

  .card-header {
    padding: 1rem;
    border-bottom: 1px solid var(--gray-200);
    font-weight: 600;
  }

  .card-body {
    padding: 1rem;
  }

  .card-footer {
    padding: 1rem;
    border-top: 1px solid var(--gray-200);
    background-color: var(--gray-100);
  }

  /* Forms */
  .form-group {
    margin-bottom: 1rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-control {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--gray-700);
    background-color: var(--white);
    background-clip: padding-box;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    transition: var(--transition);
  }

  .form-control:focus {
    color: var(--gray-700);
    background-color: var(--white);
    border-color: var(--primary);
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(26, 115, 232, 0.25);
  }

  .form-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--gray-600);
  }

  /* Grid */
  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -0.5rem;
    margin-left: -0.5rem;
  }

  .col {
    flex: 1 0 0%;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
  }

  .col-auto {
    flex: 0 0 auto;
    width: auto;
  }

  .col-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }
  .col-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
  .col-3 { flex: 0 0 25%; max-width: 25%; }
  .col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
  .col-6 { flex: 0 0 50%; max-width: 50%; }
  .col-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
  .col-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
  .col-9 { flex: 0 0 75%; max-width: 75%; }
  .col-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
  .col-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
  .col-12 { flex: 0 0 100%; max-width: 100%; }

  /* Utilities */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  
  .text-primary { color: var(--primary); }
  .text-secondary { color: var(--secondary); }
  .text-success { color: var(--success); }
  .text-danger { color: var(--danger); }
  .text-warning { color: var(--warning); }
  .text-info { color: var(--info); }
  
  .bg-primary { background-color: var(--primary); }
  .bg-secondary { background-color: var(--secondary); }
  .bg-success { background-color: var(--success); }
  .bg-danger { background-color: var(--danger); }
  .bg-warning { background-color: var(--warning); }
  .bg-info { background-color: var(--info); }
  
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 1rem; }
  .mb-4 { margin-bottom: 1.5rem; }
  .mb-5 { margin-bottom: 3rem; }
  
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 1rem; }
  .mt-4 { margin-top: 1.5rem; }
  .mt-5 { margin-top: 3rem; }
  
  .mr-1 { margin-right: 0.25rem; }
  .mr-2 { margin-right: 0.5rem; }
  .mr-3 { margin-right: 1rem; }
  .mr-4 { margin-right: 1.5rem; }
  .mr-5 { margin-right: 3rem; }
  
  .ml-1 { margin-left: 0.25rem; }
  .ml-2 { margin-left: 0.5rem; }
  .ml-3 { margin-left: 1rem; }
  .ml-4 { margin-left: 1.5rem; }
  .ml-5 { margin-left: 3rem; }
  
  .p-1 { padding: 0.25rem; }
  .p-2 { padding: 0.5rem; }
  .p-3 { padding: 1rem; }
  .p-4 { padding: 1.5rem; }
  .p-5 { padding: 3rem; }
  
  .w-25 { width: 25%; }
  .w-50 { width: 50%; }
  .w-75 { width: 75%; }
  .w-100 { width: 100%; }
  
  .rounded { border-radius: var(--border-radius); }
  .rounded-lg { border-radius: calc(var(--border-radius) * 2); }
  .rounded-circle { border-radius: 50%; }
  
  .d-none { display: none; }
  .d-inline { display: inline; }
  .d-block { display: block; }
  .d-flex { display: flex; }
  
  .flex-row { flex-direction: row; }
  .flex-column { flex-direction: column; }
  .justify-content-start { justify-content: flex-start; }
  .justify-content-end { justify-content: flex-end; }
  .justify-content-center { justify-content: center; }
  .justify-content-between { justify-content: space-between; }
  .justify-content-around { justify-content: space-around; }
  .align-items-start { align-items: flex-start; }
  .align-items-end { align-items: flex-end; }
  .align-items-center { align-items: center; }
  .align-items-baseline { align-items: baseline; }
  .align-items-stretch { align-items: stretch; }
  
  .shadow { box-shadow: var(--box-shadow); }
  .shadow-lg { box-shadow: var(--box-shadow-lg); }
  
  .border { border: 1px solid var(--gray-300); }
  .border-top { border-top: 1px solid var(--gray-300); }
  .border-right { border-right: 1px solid var(--gray-300); }
  .border-bottom { border-bottom: 1px solid var(--gray-300); }
  .border-left { border-left: 1px solid var(--gray-300); }

  /* Badge */
  .badge {
    display: inline-block;
    padding: 0.25em 0.4em;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: var(--border-radius);
  }
  
  .badge-primary { background-color: var(--primary); color: var(--white); }
  .badge-secondary { background-color: var(--secondary); color: var(--white); }
  .badge-success { background-color: var(--success); color: var(--white); }
  .badge-danger { background-color: var(--danger); color: var(--white); }
  .badge-warning { background-color: var(--warning); color: var(--dark); }
  .badge-info { background-color: var(--info); color: var(--white); }

  /* Code styles */
  pre {
    background-color: var(--code-bg);
    color: var(--code-text);
    border-radius: var(--border-radius);
    padding: 1rem;
    overflow-x: auto;
    position: relative;
    margin: 1.5rem 0;
  }

  code {
    font-family: var(--font-family-mono);
    font-size: 0.9rem;
  }

  p code, li code, h1 code, h2 code, h3 code, h4 code, h5 code, h6 code {
    background-color: var(--gray-100);
    color: var(--primary);
    padding: 0.2em 0.4em;
    border-radius: var(--border-radius);
  }

  .hljs-keyword { color: var(--code-keyword); }
  .hljs-function { color: var(--code-function); }
  .hljs-string { color: var(--code-string); }
  .hljs-number { color: var(--code-number); }
  .hljs-comment { color: var(--code-comment); }
  .hljs-operator { color: var(--code-operator); }

  /* Line numbers */
  .code-block {
    position: relative;
  }

  .code-block pre {
    padding-left: 3.5rem;
  }

  .line-numbers {
    position: absolute;
    top: 0;
    left: 0;
    width: 3rem;
    height: 100%;
    text-align: right;
    padding: 1rem 0.5rem;
    background-color: rgba(0, 0, 0, 0.1);
    color: var(--gray-500);
    font-family: var(--font-family-mono);
    font-size: 0.9rem;
    user-select: none;
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }

  /* Copy button */
  .copy-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem 0.5rem;
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--gray-400);
    border: none;
    border-radius: var(--border-radius);
    font-size: 0.75rem;
    opacity: 0;
    transition: var(--transition);
  }

  .code-block:hover .copy-button {
    opacity: 1;
  }

  .copy-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--white);
  }

  /* Article styles */
  .article {
    max-width: 800px;
    margin: 0 auto;
  }

  .article-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .article-meta {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    color: var(--gray-600);
    font-size: 0.9rem;
  }

  .article-author {
    display: flex;
    align-items: center;
    margin-right: 1.5rem;
  }

  .author-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    margin-right: 0.5rem;
    object-fit: cover;
  }

  .article-date {
    margin-right: 1.5rem;
  }

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
    gap: 0.5rem;
  }

  .article-tag {
    background-color: var(--primary-light);
    color: var(--primary);
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius);
    font-size: 0.8rem;
    transition: var(--transition);
  }

  .article-tag:hover {
    background-color: var(--primary);
    color: var(--white);
    text-decoration: none;
  }

  .article-content {
    line-height: 1.8;
    font-size: 1.1rem;
  }

  .article-content h1, 
  .article-content h2, 
  .article-content h3, 
  .article-content h4, 
  .article-content h5, 
  .article-content h6 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .article-content p {
    margin-bottom: 1.5rem;
  }

  .article-content ul, 
  .article-content ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
  }

  .article-content img {
    max-width: 100%;
    margin: 1.5rem 0;
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  .article-content blockquote {
    border-left: 4px solid var(--primary);
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
    color: var(--gray-700);
  }

  /* Table of contents */
  .toc {
    background-color: var(--gray-100);
    border-radius: var(--border-radius);
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .toc-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .toc-list {
    list-style: none;
    padding-left: 0;
  }

  .toc-item {
    margin-bottom: 0.25rem;
  }

  .toc-link {
    color: var(--gray-700);
    text-decoration: none;
  }

  .toc-link:hover {
    color: var(--primary);
  }

  .toc-item--h2 {
    margin-left: 1rem;
  }

  .toc-item--h3 {
    margin-left: 2rem;
  }

  /* Comments */
  .comments {
    margin-top: 3rem;
    border-top: 1px solid var(--gray-200);
    padding-top: 2rem;
  }

  .comments-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .comment {
    display: flex;
    margin-bottom: 1.5rem;
  }

  .comment-avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    margin-right: 1rem;
    object-fit: cover;
  }

  .comment-content {
    flex: 1;
  }

  .comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .comment-author {
    font-weight: 600;
    margin-right: 0.5rem;
  }

  .comment-date {
    font-size: 0.8rem;
    color: var(--gray-600);
  }

  .comment-body {
    line-height: 1.6;
  }

  .comment-form {
    margin-top: 2rem;
  }

  /* Toast notifications */
  .toast-container {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 1000;
  }

  .toast {
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-lg);
    padding: 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    max-width: 300px;
    animation: slideIn 0.3s, fadeOut 0.5s 2.5s forwards;
  }

  .toast-success {
    border-left: 4px solid var(--success);
  }

  .toast-error {
    border-left: 4px solid var(--danger);
  }

  .toast-warning {
    border-left: 4px solid var(--warning);
  }

  .toast-info {
    border-left: 4px solid var(--info);
  }

  .toast-icon {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }

  .toast-content {
    flex: 1;
  }

  .toast-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .toast-message {
    font-size: 0.875rem;
    color: var(--gray-700);
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  /* Search */
  .search-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto 2rem;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    background-color: var(--white);
    color: var(--dark);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 0.2rem rgba(26, 115, 232, 0.25);
  }

  .search-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray-500);
  }

  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--white);
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    z-index: 100;
    max-height: 400px;
    overflow-y: auto;
  }

  .search-result {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--gray-200);
    cursor: pointer;
    transition: var(--transition);
  }

  .search-result:last-child {
    border-bottom: none;
  }

  .search-result:hover {
    background-color: var(--primary-light);
  }

  .search-result-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .search-result-snippet {
    font-size: 0.875rem;
    color: var(--gray-600);
  }

  .search-result-highlight {
    background-color: rgba(255, 255, 0, 0.3);
    padding: 0.1rem 0;
  }

  /* Switch - for dark mode */
  .switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--gray-400);
    transition: var(--transition);
    border-radius: 24px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: var(--white);
    transition: var(--transition);
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: var(--primary);
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }

  /* Dropdown */
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-toggle {
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1000;
    display: none;
    min-width: 10rem;
    padding: 0.5rem 0;
    margin: 0.125rem 0 0;
    font-size: 1rem;
    color: var(--dark);
    text-align: left;
    list-style: none;
    background-color: var(--white);
    background-clip: padding-box;
    border: 1px solid var(--gray-200);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
  }

  .dropdown-menu.show {
    display: block;
  }

  .dropdown-item {
    display: block;
    width: 100%;
    padding: 0.5rem 1.5rem;
    clear: both;
    font-weight: 400;
    color: var(--gray-700);
    text-align: inherit;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
    text-decoration: none;
  }

  .dropdown-item:hover, .dropdown-item:focus {
    color: var(--gray-900);
    text-decoration: none;
    background-color: var(--gray-100);
  }

  .dropdown-divider {
    height: 0;
    margin: 0.5rem 0;
    overflow: hidden;
    border-top: 1px solid var(--gray-200);
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal {
    position: relative;
    z-index: 1050;
    width: 100%;
    max-width: 500px;
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow-lg);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid var(--gray-200);
  }

  .modal-title {
    margin-bottom: 0;
    line-height: 1.5;
  }

  .modal-close {
    padding: 0;
    background-color: transparent;
    border: 0;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--gray-600);
    opacity: 0.5;
  }

  .modal-body {
    position: relative;
    flex: 1 1 auto;
    padding: 1rem;
  }

  .modal-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    padding: 0.75rem;
    border-top: 1px solid var(--gray-200);
    gap: 0.5rem;
  }

  .fade-enter {
    opacity: 0;
  }

  .fade-enter-active {
    opacity: 1;
    transition: opacity 200ms;
  }

  .fade-exit {
    opacity: 1;
  }

  .fade-exit-active {
    opacity: 0;
    transition: opacity 200ms;
  }

  /* Loading spinner */
  .spinner {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    vertical-align: text-bottom;
    border: 0.25rem solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner 0.75s linear infinite;
  }

  @keyframes spinner {
    to { transform: rotate(360deg); }
  }

  .spinner-sm {
    width: 1rem;
    height: 1rem;
    border-width: 0.2rem;
  }

  /* Pagination */
  .pagination {
    display: flex;
    list-style: none;
    border-radius: var(--border-radius);
  }

  .page-item:first-child .page-link {
    margin-left: 0;
    border-top-left-radius: var(--border-radius);
    border-bottom-left-radius: var(--border-radius);
  }

  .page-item:last-child .page-link {
    border-top-right-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
  }

  .page-item.active .page-link {
    z-index: 3;
    color: var(--white);
    background-color: var(--primary);
    border-color: var(--primary);
  }

  .page-item.disabled .page-link {
    color: var(--gray-500);
    pointer-events: none;
    cursor: not-allowed;
    background-color: var(--white);
    border-color: var(--gray-300);
  }

  .page-link {
    position: relative;
    display: block;
    padding: 0.5rem 0.75rem;
    margin-left: -1px;
    line-height: 1.25;
    color: var(--primary);
    background-color: var(--white);
    border: 1px solid var(--gray-300);
    text-decoration: none;
  }

  .page-link:hover {
    z-index: 2;
    color: var(--primary);
    text-decoration: none;
    background-color: var(--gray-200);
    border-color: var(--gray-300);
  }

  .page-link:focus {
    z-index: 3;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(26, 115, 232, 0.25);
  }
  
  /* Avatar fallback */
  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: var(--primary);
    color: var(--white);
    font-weight: bold;
    text-transform: uppercase;
  }
  
  /* Role styles */
  .role-badge {
    display: inline-block;
    padding: 0.25em 0.5em;
    border-radius: var(--border-radius);
    margin-left: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .role-admin {
    background-color: var(--danger);
    color: var(--white);
  }
  
  .role-editor {
    background-color: var(--info);
    color: var(--white);
  }
  
  .role-writer {
    background-color: var(--primary);
    color: var(--white);
  }
  
  .role-moderator {
    background-color: var(--warning);
    color: var(--dark);
  }
  
  .role-reader {
    background-color: var(--secondary);
    color: var(--white);
  }

  /* Admin dashboard */
  .admin-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background-color: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    padding: 1.5rem;
    text-align: center;
  }
  
  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    font-size: 1.1rem;
    color: var(--gray-600);
  }
  
  .admin-tabs {
    display: flex;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--gray-300);
  }
  
  .admin-tab {
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    font-weight: 500;
  }
  
  .admin-tab.active {
    border-bottom-color: var(--primary);
    color: var(--primary);
  }
  
  /* Permissions editor */
  .permissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .permission-item {
    border: 1px solid var(--gray-300);
    border-radius: var(--border-radius);
    padding: 1rem;
  }
  
  .permission-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .permission-description {
    font-size: 0.875rem;
    color: var(--gray-600);
    margin-bottom: 1rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .navbar {
      flex-direction: column;
      align-items: flex-start;
    }

    .navbar-menu {
      margin-top: 1rem;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }

    .navbar-item {
      margin-bottom: 0.5rem;
    }

    .article-title {
      font-size: 2rem;
    }

    .article-meta {
      flex-direction: column;
      align-items: flex-start;
    }

    .article-author, .article-date {
      margin-bottom: 0.5rem;
    }

    .col-md-6 {
      flex: 0 0 100%;
      max-width: 100%;
    }
    
    .admin-stats {
      grid-template-columns: 1fr;
    }
  }

  /* Print styles */
  @media print {
    .navbar, .footer, .comments {
      display: none;
    }

    body {
      font-size: 12pt;
    }

    a[href]:after {
      content: " (" attr(href) ")";
    }

    abbr[title]:after {
      content: " (" attr(title) ")";
    }

    pre, blockquote {
      border: 1px solid var(--gray-300);
      page-break-inside: avoid;
    }

    thead {
      display: table-header-group;
    }

    tr, img {
      page-break-inside: avoid;
    }

    img {
      max-width: 100% !important;
    }

    p, h2, h3 {
      orphans: 3;
      widows: 3;
    }

    h2, h3 {
      page-break-after: avoid;
    }
  }
`;

// ==============================================
// CONTEXT PROVIDERS
// ==============================================

// Define all available roles with their permissions
const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  WRITER: 'writer',
  MODERATOR: 'moderator',
  READER: 'reader'
};

// Define permissions
const PERMISSIONS = {
  CREATE_ARTICLE: 'create_article',
  EDIT_ANY_ARTICLE: 'edit_any_article',
  EDIT_OWN_ARTICLE: 'edit_own_article',
  DELETE_ANY_ARTICLE: 'delete_any_article',
  DELETE_OWN_ARTICLE: 'delete_own_article',
  CREATE_COMMENT: 'create_comment',
  EDIT_ANY_COMMENT: 'edit_any_comment',
  EDIT_OWN_COMMENT: 'edit_own_comment',
  DELETE_ANY_COMMENT: 'delete_any_comment',
  DELETE_OWN_COMMENT: 'delete_own_comment',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_TAGS: 'manage_tags',
  MANAGE_SETTINGS: 'manage_settings'
};

// Role permissions map
const DEFAULT_ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_ARTICLE,
    PERMISSIONS.EDIT_ANY_ARTICLE,
    PERMISSIONS.EDIT_OWN_ARTICLE,
    PERMISSIONS.DELETE_ANY_ARTICLE,
    PERMISSIONS.DELETE_OWN_ARTICLE,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.EDIT_ANY_COMMENT,
    PERMISSIONS.EDIT_OWN_COMMENT,
    PERMISSIONS.DELETE_ANY_COMMENT,
    PERMISSIONS.DELETE_OWN_COMMENT,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.MANAGE_TAGS,
    PERMISSIONS.MANAGE_SETTINGS
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.CREATE_ARTICLE,
    PERMISSIONS.EDIT_ANY_ARTICLE,
    PERMISSIONS.EDIT_OWN_ARTICLE,
    PERMISSIONS.DELETE_OWN_ARTICLE,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.EDIT_OWN_COMMENT,
    PERMISSIONS.DELETE_OWN_COMMENT
  ],
  [ROLES.WRITER]: [
    PERMISSIONS.CREATE_ARTICLE,
    PERMISSIONS.EDIT_OWN_ARTICLE,
    PERMISSIONS.DELETE_OWN_ARTICLE,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.EDIT_OWN_COMMENT,
    PERMISSIONS.DELETE_OWN_COMMENT
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.EDIT_ANY_COMMENT,
    PERMISSIONS.DELETE_ANY_COMMENT,
    PERMISSIONS.EDIT_OWN_COMMENT,
    PERMISSIONS.DELETE_OWN_COMMENT
  ],
  [ROLES.READER]: [
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.EDIT_OWN_COMMENT,
    PERMISSIONS.DELETE_OWN_COMMENT
  ]
};

// AppContext - Holds the main state for the application
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [articles, setArticles] = useState(() => {
    const savedArticles = localStorage.getItem('articles');
    return savedArticles ? JSON.parse(savedArticles) : sampleArticles;
  });
  
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : sampleUsers;
  });
  
  const [comments, setComments] = useState(() => {
    const savedComments = localStorage.getItem('comments');
    return savedComments ? JSON.parse(savedComments) : sampleComments;
  });
  
  const [tags, setTags] = useState(() => {
    const savedTags = localStorage.getItem('tags');
    return savedTags ? JSON.parse(savedTags) : sampleTags;
  });
  
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [notifications, setNotifications] = useState([]);

  const [rolePermissions, setRolePermissions] = useState(() => {
    const savedRolePermissions = localStorage.getItem('rolePermissions');
    return savedRolePermissions ? JSON.parse(savedRolePermissions) : DEFAULT_ROLE_PERMISSIONS;
  });

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings) : {
      siteName: 'CodeBlog',
      siteDescription: 'A platform for developers to share knowledge and insights.',
      logoUrl: '',
      allowRegistration: true,
      requireEmailVerification: false,
      enableComments: true,
      articlesPerPage: 6,
      defaultUserRole: ROLES.READER
    };
  });

  useEffect(() => {
    localStorage.setItem('articles', JSON.stringify(articles));
  }, [articles]);
  
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    localStorage.setItem('comments', JSON.stringify(comments));
  }, [comments]);
  
  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rolePermissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Auth functions
  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      addNotification('Success', 'Logged in successfully!', 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    addNotification('Success', 'Logged out successfully!', 'success');
  };

  const register = (userData) => {
    if (users.some(u => u.email === userData.email)) {
      return false;
    }
    
    const newUser = {
      id: uuidv4(),
      ...userData,
      role: settings.defaultUserRole,
      createdAt: new Date().toISOString()
    };
    
    setUsers(prevUsers => [...prevUsers, newUser]);
    
    const { password, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    addNotification('Success', 'Account created successfully!', 'success');
    return true;
  };

  // Article functions
  const addArticle = (articleData) => {
    const newArticle = {
      id: uuidv4(),
      ...articleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentUser.id,
      author: currentUser.name,
      likes: 0,
      views: 0
    };
    
    setArticles(prevArticles => [...prevArticles, newArticle]);
    addNotification('Success', 'Article published successfully!', 'success');
    return newArticle.id;
  };

  const updateArticle = (id, articleData) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === id 
          ? { 
              ...article, 
              ...articleData, 
              updatedAt: new Date().toISOString() 
            } 
          : article
      )
    );
    addNotification('Success', 'Article updated successfully!', 'success');
  };

  const deleteArticle = (id) => {
    setArticles(prevArticles => prevArticles.filter(article => article.id !== id));
    setComments(prevComments => prevComments.filter(comment => comment.articleId !== id));
    addNotification('Success', 'Article deleted successfully!', 'success');
  };

  const getArticleById = (id) => {
    return articles.find(article => article.id === id);
  };

  const incrementArticleViews = (id) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === id 
          ? { ...article, views: article.views + 1 } 
          : article
      )
    );
  };

  const toggleArticleLike = (id) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === id 
          ? { ...article, likes: article.likes + 1 } 
          : article
      )
    );
  };

  // Comment functions
  const addComment = (articleId, content) => {
    const newComment = {
      id: uuidv4(),
      articleId,
      userId: currentUser.id,
      author: currentUser.name,
      content,
      createdAt: new Date().toISOString()
    };
    
    setComments(prevComments => [...prevComments, newComment]);
    addNotification('Success', 'Comment added successfully!', 'success');
    return newComment.id;
  };

  const updateComment = (id, content) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === id 
          ? { ...comment, content, updatedAt: new Date().toISOString() } 
          : comment
      )
    );
    addNotification('Success', 'Comment updated successfully!', 'success');
  };

  const deleteComment = (id) => {
    setComments(prevComments => prevComments.filter(comment => comment.id !== id));
    addNotification('Success', 'Comment deleted successfully!', 'success');
  };

  const getArticleComments = (articleId) => {
    return comments.filter(comment => comment.articleId === articleId);
  };

  // Tag functions
  const addTag = (name) => {
    if (tags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
      return false;
    }
    
    const newTag = {
      id: uuidv4(),
      name,
      count: 0
    };
    
    setTags(prevTags => [...prevTags, newTag]);
    return true;
  };

  const updateTag = (id, name) => {
    setTags(prevTags => 
      prevTags.map(tag => 
        tag.id === id 
          ? { ...tag, name } 
          : tag
      )
    );
    addNotification('Success', 'Tag updated successfully!', 'success');
  };

  const deleteTag = (id) => {
    // Remove tag from articles
    const tagToDelete = tags.find(tag => tag.id === id);
    if (tagToDelete) {
      setArticles(prevArticles => 
        prevArticles.map(article => ({
          ...article,
          tags: article.tags.filter(tag => tag !== tagToDelete.name)
        }))
      );
    }
    
    // Delete tag
    setTags(prevTags => prevTags.filter(tag => tag.id !== id));
    addNotification('Success', 'Tag deleted successfully!', 'success');
  };

  const incrementTagCount = (tagName) => {
    setTags(prevTags => 
      prevTags.map(tag => 
        tag.name.toLowerCase() === tagName.toLowerCase() 
          ? { ...tag, count: tag.count + 1 } 
          : tag
      )
    );
  };

  const decrementTagCount = (tagName) => {
    setTags(prevTags => 
      prevTags.map(tag => 
        tag.name.toLowerCase() === tagName.toLowerCase() 
          ? { ...tag, count: Math.max(0, tag.count - 1) } 
          : tag
      )
    );
  };

  // User functions
  const addUser = (userData) => {
    if (users.some(u => u.email === userData.email)) {
      return false;
    }
    
    const newUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    setUsers(prevUsers => [...prevUsers, newUser]);
    addNotification('Success', 'User added successfully!', 'success');
    return true;
  };

  const updateUser = (id, userData) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === id 
          ? { ...user, ...userData } 
          : user
      )
    );
    
    // Update current user if it's the same user
    if (currentUser && currentUser.id === id) {
      const updatedUser = users.find(user => user.id === id);
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        setCurrentUser({ ...userWithoutPassword, ...userData });
      }
    }
    
    addNotification('Success', 'User updated successfully!', 'success');
  };

  const deleteUser = (id) => {
    // Delete user's articles
    const userArticles = articles.filter(article => article.userId === id);
    userArticles.forEach(article => {
      deleteArticle(article.id);
    });
    
    // Delete user's comments
    setComments(prevComments => prevComments.filter(comment => comment.userId !== id));
    
    // Delete user
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    
    addNotification('Success', 'User deleted successfully!', 'success');
  };

  const updateUserRole = (userId, role) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, role } 
          : user
      )
    );
    
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role }));
    }
    
    addNotification('Success', 'User role updated successfully!', 'success');
  };

  const updateUserProfile = (userData) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === currentUser.id 
          ? { ...user, ...userData } 
          : user
      )
    );
    
    setCurrentUser(prev => ({ ...prev, ...userData }));
    addNotification('Success', 'Profile updated successfully!', 'success');
  };

  // Search function
  const searchArticles = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  // Role and permission functions
  const createRole = (role, permissions) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: permissions
    }));
    addNotification('Success', `Role '${role}' created successfully!`, 'success');
  };

  const updateRolePermissions = (role, permissions) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: permissions
    }));
    addNotification('Success', `Permissions for role '${role}' updated successfully!`, 'success');
  };

  const deleteRole = (role) => {
    // Check if any users have this role
    const usersWithRole = users.filter(user => user.role === role);
    if (usersWithRole.length > 0) {
      // Change users' role to reader (or default role)
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.role === role 
            ? { ...user, role: ROLES.READER } 
            : user
        )
      );
    }
    
    // Delete role
    setRolePermissions(prev => {
      const { [role]: removedRole, ...rest } = prev;
      return rest;
    });
    
    addNotification('Success', `Role '${role}' deleted successfully!`, 'success');
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    const permissions = rolePermissions[userRole] || [];
    
    return permissions.includes(permission);
  };

  // Settings functions
  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
    addNotification('Success', 'Settings updated successfully!', 'success');
  };

  // Notification functions
  const addNotification = (title, message, type = 'info') => {
    const id = uuidv4();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Check permissions
  const canEditArticle = (articleUserId) => {
    if (!currentUser) return false;
    if (hasPermission(PERMISSIONS.EDIT_ANY_ARTICLE)) return true;
    if (currentUser.id === articleUserId && hasPermission(PERMISSIONS.EDIT_OWN_ARTICLE)) return true;
    return false;
  };

  const canDeleteArticle = (articleUserId) => {
    if (!currentUser) return false;
    if (hasPermission(PERMISSIONS.DELETE_ANY_ARTICLE)) return true;
    if (currentUser.id === articleUserId && hasPermission(PERMISSIONS.DELETE_OWN_ARTICLE)) return true;
    return false;
  };

  const canCreateArticle = () => {
    if (!currentUser) return false;
    return hasPermission(PERMISSIONS.CREATE_ARTICLE);
  };

  const canEditComment = (commentUserId) => {
    if (!currentUser) return false;
    if (hasPermission(PERMISSIONS.EDIT_ANY_COMMENT)) return true;
    if (currentUser.id === commentUserId && hasPermission(PERMISSIONS.EDIT_OWN_COMMENT)) return true;
    return false;
  };

  const canDeleteComment = (commentUserId) => {
    if (!currentUser) return false;
    if (hasPermission(PERMISSIONS.DELETE_ANY_COMMENT)) return true;
    if (currentUser.id === commentUserId && hasPermission(PERMISSIONS.DELETE_OWN_COMMENT)) return true;
    return false;
  };

  const canManageUsers = () => {
    if (!currentUser) return false;
    return hasPermission(PERMISSIONS.MANAGE_USERS);
  };

  const canManageRoles = () => {
    if (!currentUser) return false;
    return hasPermission(PERMISSIONS.MANAGE_ROLES);
  };

  const canManageTags = () => {
    if (!currentUser) return false;
    return hasPermission(PERMISSIONS.MANAGE_TAGS);
  };

  const canManageSettings = () => {
    if (!currentUser) return false;
    return hasPermission(PERMISSIONS.MANAGE_SETTINGS);
  };

  // Stats functions
  const getStats = () => {
    return {
      totalArticles: articles.length,
      totalUsers: users.length,
      totalComments: comments.length,
      totalTags: tags.length,
      articleViews: articles.reduce((total, article) => total + article.views, 0),
      articleLikes: articles.reduce((total, article) => total + article.likes, 0),
      topArticles: [...articles]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5),
      topAuthors: [...users]
        .map(user => ({
          id: user.id,
          name: user.name,
          articlesCount: articles.filter(article => article.userId === user.id).length
        }))
        .sort((a, b) => b.articlesCount - a.articlesCount)
        .slice(0, 5),
      popularTags: [...tags]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };
  };

  return (
    <AppContext.Provider value={{
      articles,
      users,
      comments,
      tags,
      theme,
      currentUser,
      notifications,
      rolePermissions,
      settings,
      ROLES,
      PERMISSIONS,
      toggleTheme,
      login,
      logout,
      register,
      addArticle,
      updateArticle,
      deleteArticle,
      getArticleById,
      incrementArticleViews,
      toggleArticleLike,
      addComment,
      updateComment,
      deleteComment,
      getArticleComments,
      addTag,
      updateTag,
      deleteTag,
      incrementTagCount,
      decrementTagCount,
      addUser,
      updateUser,
      deleteUser,
      updateUserRole,
      updateUserProfile,
      searchArticles,
      createRole,
      updateRolePermissions,
      deleteRole,
      hasPermission,
      updateSettings,
      addNotification,
      canEditArticle,
      canDeleteArticle,
      canCreateArticle,
      canEditComment,
      canDeleteComment,
      canManageUsers,
      canManageRoles,
      canManageTags,
      canManageSettings,
      getStats
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the AppContext
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// AuthContext - For handling authentication
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const { currentUser, login, logout, register, hasPermission } = useAppContext();
  
  const isAuthenticated = !!currentUser;
  
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      hasRole,
      hasPermission,
      login,
      logout,
      register,
      currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the AuthContext
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Format date to readable format
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Format date with time
const formatDateTime = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Calculate reading time
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
};

// Parse and sanitize markdown with code highlighting
const parseMarkdown = (markdown) => {
  // Configure marked with code highlighting
  marked.setOptions({
    highlight: function(code, lang) {
      try {
        return hljs.highlight(code, { language: lang || 'plaintext' }).value;
      } catch (err) {
        return hljs.highlight(code, { language: 'plaintext' }).value;
      }
    },
    breaks: true,
    gfm: true
  });
  
  // Parse markdown to HTML
  const rawHtml = marked.parse(markdown);
  
  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  
  return sanitizedHtml;
};

// Extract table of contents from markdown
const extractToc = (markdown) => {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc = [];
  
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const slug = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    
    toc.push({ level, title, slug });
  }
  
  return toc;
};

// Generate avatar content
const getAvatarContent = (name) => {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.charAt(0);
  }
  
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
};

// Generate random avatar URL with fallback
const getAvatar = (seed, name) => {
  try {
    return `https://i.pravatar.cc/150?u=${seed}`;
  } catch (error) {
    console.error('Avatar service error:', error);
    return null;
  }
};

// Get avatar component with fallback
const Avatar = ({ userId, name, size = 'md', className = '' }) => {
  const [error, setError] = useState(false);
  const avatarSizes = {
    sm: '32px',
    md: '48px',
    lg: '96px',
    xl: '150px'
  };
  
  const avatarStyle = {
    width: avatarSizes[size] || avatarSizes.md,
    height: avatarSizes[size] || avatarSizes.md,
    borderRadius: '50%',
    overflow: 'hidden'
  };
  
  if (error) {
    return (
      <div 
        className={`avatar-fallback ${className}`} 
        style={avatarStyle}
        title={name}
      >
        {getAvatarContent(name)}
      </div>
    );
  }
  
  return (
    <img 
      src={getAvatar(userId, name)}
      alt={name} 
      className={className}
      style={avatarStyle}
      onError={() => setError(true)}
      title={name}
    />
  );
};

// Token handling for JWT
const getToken = () => localStorage.getItem('token');

const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const parseToken = (token) => {
  try {
    return jwt_decode(token);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  const decoded = parseToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

// Role display name
const getRoleDisplayName = (role) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// ==============================================
// ROUTE PROTECTION COMPONENTS
// ==============================================

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = window.location.pathname;
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location}`} />;
  }
  
  return children;
};

// Permission Route component
const PermissionRoute = ({ permission, children }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = window.location.pathname;
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location}`} />;
  }
  
  if (!hasPermission(permission)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// ==============================================
// HOOKS
// ==============================================

// Hook for tracking when elements are in view
const useInView = (options = {}) => {
  const [ref, setRef] = useState(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return [setRef, isInView];
};

// Hook for handling forms
const useForm = (initialValues = {}, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  };

  const handleSubmit = (callback) => (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate form
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      // Check if there are any errors
      const hasErrors = Object.keys(validationErrors).length > 0;
      if (hasErrors) return;
    }
    
    setIsSubmitting(true);
    callback(values, () => setIsSubmitting(false));
  };

  const resetForm = (newValues = {}) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues
  };
};

// Hook for local storage state
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

// Hook for handling modals
const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return { isOpen, open, close, toggle };
};

// Hook for detecting clicks outside an element
const useOutsideClick = (callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
};

// Hook for debouncing values
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for query params
const useQueryParam = (param) => {
  const [searchParams] = useSearchParams();
  return searchParams.get(param);
};

// ==============================================
// UI COMPONENTS
// ==============================================

// Toast notification component
const Toast = ({ notification, onClose }) => {
  const { id, title, message, type } = notification;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [id, onClose]);
  
  let icon;
  switch (type) {
    case 'success':
      icon = '✓';
      break;
    case 'error':
      icon = '✗';
      break;
    case 'warning':
      icon = '!';
      break;
    default:
      icon = 'i';
  }
  
  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{icon}</div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
};

// Toast container component
const ToastContainer = () => {
  const { notifications } = useAppContext();
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} onClose={() => {}} />
      ))}
    </div>
  );
};

// Loading spinner component
const Spinner = ({ size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : '';
  
  return <div className={`spinner ${sizeClass}`} />;
};

// Button component
const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '',
  ...rest 
}) => {
  const classes = `btn btn-${variant} btn-${size} ${className}`;
  
  return (
    <button 
      type={type} 
      className={classes} 
      onClick={onClick} 
      disabled={disabled} 
      {...rest}
    >
      {children}
    </button>
  );
};

// Input component
const Input = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  onBlur,
  error,
  touched,
  helperText,
  required = false,
  ...rest 
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <input
        className="form-control"
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...rest}
      />
      
      {touched && error && <div className="text-danger mt-1">{error}</div>}
      {helperText && <small className="form-text">{helperText}</small>}
    </div>
  );
};

// Textarea component
const Textarea = ({ 
  label, 
  name, 
  placeholder, 
  value, 
  onChange, 
  onBlur,
  error,
  touched,
  helperText,
  required = false,
  rows = 5,
  ...rest 
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <textarea
        className="form-control"
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        {...rest}
      />
      
      {touched && error && <div className="text-danger mt-1">{error}</div>}
      {helperText && <small className="form-text">{helperText}</small>}
    </div>
  );
};

// Select component
const Select = ({ 
  label, 
  name, 
  options, 
  value, 
  onChange, 
  onBlur,
  error,
  touched,
  helperText,
  required = false,
  ...rest 
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <select
        className="form-control"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {touched && error && <div className="text-danger mt-1">{error}</div>}
      {helperText && <small className="form-text">{helperText}</small>}
    </div>
  );
};

// Checkbox component
const Checkbox = ({ 
  label, 
  name, 
  checked, 
  onChange, 
  error,
  touched,
  helperText,
  ...rest 
}) => {
  return (
    <div className="form-group">
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          {...rest}
        />
        <label className="form-check-label" htmlFor={name}>
          {label}
        </label>
      </div>
      
      {touched && error && <div className="text-danger mt-1">{error}</div>}
      {helperText && <small className="form-text">{helperText}</small>}
    </div>
  );
};

// Modal component
const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;
  
  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  // Size classes
  const sizeClasses = {
    sm: 'max-width: 400px',
    md: 'max-width: 500px',
    lg: 'max-width: 800px',
    xl: 'max-width: 1000px'
  };
  
  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" style={{ [sizeClasses[size]]: true }}>
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// Card component
const Card = ({ title, children, footer, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

// Dropdown component
const Dropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useOutsideClick(() => setIsOpen(false));
  
  const toggle = () => setIsOpen(!isOpen);
  
  return (
    <div className="dropdown" ref={ref}>
      <div className="dropdown-toggle" onClick={toggle}>
        {trigger}
      </div>
      {isOpen && (
        <div className="dropdown-menu show">
          {children}
        </div>
      )}
    </div>
  );
};

// Dropdown item component
const DropdownItem = ({ children, onClick }) => {
  return (
    <button className="dropdown-item" onClick={onClick}>
      {children}
    </button>
  );
};

// Dropdown divider component
const DropdownDivider = () => {
  return <div className="dropdown-divider"></div>;
};

// Badge component
const Badge = ({ children, variant = 'primary', className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

// Table component
const Table = ({ headers, data, renderRow, className = '' }) => {
  return (
    <div className="table-responsive">
      <table className={`table ${className}`}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => renderRow(item, index))}
        </tbody>
      </table>
    </div>
  );
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  
  // Add first page
  pages.push(1);
  
  // Add ellipsis if needed
  if (currentPage > 3) {
    pages.push('...');
  }
  
  // Add pages around current page
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i);
  }
  
  // Add ellipsis if needed
  if (currentPage < totalPages - 2) {
    pages.push('...');
  }
  
  // Add last page if not already added
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return (
    <nav>
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>
        
        {pages.map((page, index) => (
          <li 
            key={index} 
            className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
          >
            <button 
              className="page-link" 
              onClick={() => page !== '...' && onPageChange(page)}
              disabled={page === '...'}
            >
              {page}
            </button>
          </li>
        ))}
        
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

// Code block component with line numbers and copy button
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  
  // Generate line numbers
  const lines = code.split('\n');
  const lineNumbers = Array.from({ length: lines.length }, (_, i) => i + 1);
  
  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  return (
    <div className="code-block">
      <div className="line-numbers">
        {lineNumbers.map((number) => (
          <div key={number}>{number}</div>
        ))}
      </div>
      
      <pre>
        <code className={language ? `language-${language}` : ''}>
          {code}
        </code>
      </pre>
      
      <button className="copy-button" onClick={copyToClipboard}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

// Tag input component
const TagInput = ({ value, onChange, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };
  
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      // Add tag if not already in the list
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag when backspace is pressed and input is empty
      onChange(value.slice(0, -1));
    }
  };
  
  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };
  
  const addTag = (tag) => {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
    
    setInputValue('');
    setShowSuggestions(false);
  };
  
  // Filter suggestions based on input value
  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(suggestion)
  );
  
  return (
    <div className="form-group">
      <div className="border rounded p-2 d-flex flex-wrap align-items-center">
        {/* Display selected tags */}
        {value.map((tag) => (
          <div key={tag} className="badge badge-primary mr-1 mb-1 d-flex align-items-center">
            {tag}
            <span className="ml-1" onClick={() => removeTag(tag)} style={{ cursor: 'pointer' }}>
              &times;
            </span>
          </div>
        ))}
        
        {/* Input for new tags */}
        <input
          type="text"
          className="border-0 flex-grow-1"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
          placeholder={value.length === 0 ? "Add tags..." : ""}
          style={{ outline: 'none' }}
        />
      </div>
      
      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="border rounded mt-1">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="p-2 border-bottom"
              onClick={() => addTag(suggestion)}
              style={{ cursor: 'pointer' }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      
      <small className="form-text">Press Enter to add a tag, Backspace to remove the last tag</small>
    </div>
  );
};

// Theme toggle component
const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppContext();
  
  return (
    <div className="d-flex align-items-center">
      <span className="mr-2">☀️</span>
      <label className="switch">
        <input 
          type="checkbox" 
          checked={theme === 'dark'} 
          onChange={toggleTheme}
        />
        <span className="slider"></span>
      </label>
      <span className="ml-2">🌙</span>
    </div>
  );
};

// Search component
const Search = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);
  
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="search-icon">🔍</div>
    </div>
  );
};

// ==============================================
// PAGE COMPONENTS
// ==============================================

// Navbar component
const Navbar = () => {
  const { isAuthenticated, currentUser, logout, hasPermission } = useAuth();
  const { canCreateArticle, settings, PERMISSIONS } = useAppContext();
  const navigate = useNavigate();
  
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">{settings.siteName}</Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Home</Link>
          <Link to="/tags" className="navbar-item">Tags</Link>
          
          {canCreateArticle() && (
            <Link to="/articles/new" className="navbar-item">Write</Link>
          )}
          
          <ThemeToggle />
          
          {isAuthenticated ? (
            <Dropdown 
              trigger={
                <div className="d-flex align-items-center">
                  <Avatar 
                    userId={currentUser.id} 
                    name={currentUser.name} 
                    size="sm"
                    className="mr-2"
                  />
                  <span>{currentUser.name}</span>
                  {currentUser.role && (
                    <span className={`role-badge role-${currentUser.role}`}>
                      {getRoleDisplayName(currentUser.role)}
                    </span>
                  )}
                </div>
              }
            >
              <DropdownItem onClick={() => navigate('/profile')}>
                Profile
              </DropdownItem>
              
              <DropdownItem onClick={() => navigate('/my-articles')}>
                My Articles
              </DropdownItem>
              
              {hasPermission(PERMISSIONS.MANAGE_USERS) && (
                <DropdownItem onClick={() => navigate('/admin')}>
                  Admin Dashboard
                </DropdownItem>
              )}
              
              <DropdownDivider />
              
              <DropdownItem onClick={logout}>
                Logout
              </DropdownItem>
            </Dropdown>
          ) : (
            <>
              <Link to="/login" className="navbar-item">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Footer component
const Footer = () => {
  const { settings } = useAppContext();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col">
            <h5>{settings.siteName}</h5>
            <p>{settings.siteDescription}</p>
          </div>
          
          <div className="col">
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/tags">Tags</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </div>
          
          <div className="col">
            <h5>Connect</h5>
            <ul className="list-unstyled">
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p>&copy; {currentYear} {settings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Home page component
const HomePage = () => {
  const { articles, tags, settings } = useAppContext();
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const tagParam = useQueryParam('tag');
  
  // Set selected tag from URL param
  useEffect(() => {
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, [tagParam]);
  
  // Sort articles by date (newest first)
  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [articles]);
  
  // Filter articles by tag if selected
  useEffect(() => {
    if (selectedTag) {
      setFilteredArticles(sortedArticles.filter(article => article.tags.includes(selectedTag)));
    } else {
      setFilteredArticles(sortedArticles);
    }
    setCurrentPage(1);
  }, [selectedTag, sortedArticles]);
  
  // Get popular tags (top 10)
  const popularTags = useMemo(() => {
    return [...tags]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [tags]);
  
  // Handle search
  const handleSearch = (query) => {
    if (!query) {
      setFilteredArticles(sortedArticles);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = sortedArticles.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredArticles(filtered);
    setCurrentPage(1);
  };
  
  // Pagination logic
  const articlesPerPage = settings.articlesPerPage || 6;
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  
  return (
    <div className="container">
      <h1 className="mb-4">Latest Articles</h1>
      
      <div className="row mb-4">
        <div className="col-md-8">
          <Search onSearch={handleSearch} />
        </div>
        
        <div className="col-md-4">
          <div className="d-flex justify-content-end align-items-center">
            <label className="mr-2 mb-0">Filter by tag:</label>
            <select 
              className="form-control w-50"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">All tags</option>
              {popularTags.map(tag => (
                <option key={tag.id} value={tag.name}>{tag.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {filteredArticles.length === 0 ? (
        <div className="text-center my-5">
          <h3>No articles found</h3>
          <p>Try changing your search or filters, or check back later for new content.</p>
        </div>
      ) : (
        <>
          <div className="row">
            {currentArticles.map(article => (
              <div key={article.id} className="col-md-6 col-lg-4 mb-4">
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Article card component
const ArticleCard = ({ article }) => {
  const navigate = useNavigate();
  
  const { id, title, content, author, createdAt, tags, likes, views } = article;
  
  // Truncate content for preview
  const truncatedContent = content.length > 150 
    ? content.substring(0, 150) + '...' 
    : content;
  
  // Calculate reading time
  const readingTime = calculateReadingTime(content);
  
  return (
    <div className="card h-100">
      <div className="card-body">
        <h3 className="card-title mb-2">
          <Link to={`/articles/${id}`}>{title}</Link>
        </h3>
        
        <div className="d-flex align-items-center mb-3">
          <Avatar 
            userId={article.userId} 
            name={author} 
            size="sm"
            className="mr-2"
          />
          <span className="mr-2">{author}</span>
          <span className="text-muted">{formatDate(createdAt)}</span>
        </div>
        
        <p className="card-text">{truncatedContent}</p>
        
        <div className="article-tags mb-3">
          {tags.map(tag => (
            <Link 
              key={tag} 
              to={`/?tag=${tag}`} 
              className="article-tag mr-1"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/?tag=${tag}`);
              }}
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="card-footer d-flex justify-content-between align-items-center">
        <div>
          <span className="mr-3">👁️ {views}</span>
          <span>❤️ {likes}</span>
        </div>
        
        <div>
          <small className="text-muted">{readingTime} min read</small>
        </div>
      </div>
    </div>
  );
};

// Article detail page component
const ArticleDetailPage = () => {
  const { id } = useParams();
  const { 
    getArticleById, 
    incrementArticleViews, 
    toggleArticleLike, 
    getArticleComments, 
    addComment, 
    updateComment,
    deleteComment,
    deleteArticle,
    canEditArticle,
    canDeleteArticle,
    canEditComment,
    canDeleteComment,
    settings
  } = useAppContext();
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const article = getArticleById(id);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Fetch comments
  useEffect(() => {
    if (article) {
      setComments(getArticleComments(article.id));
    }
  }, [article, getArticleComments]);
  
  // Increment view count on component mount
  useEffect(() => {
    if (article) {
      incrementArticleViews(article.id);
    }
  }, [article, incrementArticleViews]);
  
  // Handle article not found
  if (!article) {
    return (
      <div className="container text-center my-5">
        <h2>Article not found</h2>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }
  
  // Parse article content as markdown
  const sanitizedHtml = parseMarkdown(article.content);
  
  // Extract table of contents
  const toc = extractToc(article.content);
  
  // Calculate reading time
  const readingTime = calculateReadingTime(article.content);
  
  // Handle like button click
  const handleLike = () => {
    if (isAuthenticated) {
      toggleArticleLike(article.id);
    } else {
      navigate('/login', { state: { from: `/articles/${article.id}` } });
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    
    if (!commentContent.trim()) return;
    
    if (editingComment) {
      updateComment(editingComment.id, commentContent);
      setEditingComment(null);
    } else {
      addComment(article.id, commentContent);
    }
    
    setCommentContent('');
    setComments(getArticleComments(article.id));
  };
  
  // Handle comment edit
  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setCommentContent(comment.content);
  };
  
  // Handle comment deletion
  const handleDeleteComment = (commentId) => {
    deleteComment(commentId);
    setComments(getArticleComments(article.id));
  };
  
  // Handle article deletion
  const handleDeleteArticle = () => {
    deleteArticle(article.id);
    navigate('/');
  };
  
  return (
    <div className="container">
      <article className="article">
        <h1 className="article-title">{article.title}</h1>
        
        <div className="article-meta">
          <div className="article-author">
            <Avatar 
              userId={article.userId} 
              name={article.author} 
              size="md" 
              className="author-avatar"
            />
            <span>{article.author}</span>
          </div>
          
          <div className="article-date">
            {formatDate(article.createdAt)}
          </div>
          
          <div>{readingTime} min read</div>
        </div>
        
        <div className="article-tags">
          {article.tags.map(tag => (
            <Link 
              key={tag} 
              to={`/?tag=${tag}`} 
              className="article-tag"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/?tag=${tag}`);
              }}
            >
              {tag}
            </Link>
          ))}
        </div>
        
        {toc.length > 0 && (
          <div className="toc">
            <div className="toc-title">Table of Contents</div>
            <ul className="toc-list">
              {toc.map((item, index) => (
                <li key={index} className={`toc-item toc-item--h${item.level}`}>
                  <a href={`#${item.slug}`} className="toc-link">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div 
          className="article-content" 
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
        />
        
        <div className="d-flex justify-content-between align-items-center my-4">
          <div>
            <Button variant="outline" onClick={handleLike} className="mr-2">
              ❤️ {article.likes} Like
            </Button>
            
            <Button variant="outline" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>
              💬 {comments.length} Comment
            </Button>
          </div>
          
          {canEditArticle(article.userId) && (
            <div>
              <Button 
                variant="outline" 
                className="mr-2" 
                onClick={() => navigate(`/articles/${article.id}/edit`)}
              >
                Edit
              </Button>
              
              {canDeleteArticle(article.userId) && (
                <Button 
                  variant="danger" 
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
        
        {settings.enableComments && (
          <div className="comments">
            <h3 className="comments-title">Comments ({comments.length})</h3>
            
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="comment-form mb-4">
                <Textarea
                  placeholder={editingComment ? "Edit your comment..." : "Write a comment..."}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={3}
                />
                <div className="d-flex justify-content-between mt-2">
                  {editingComment && (
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => {
                        setEditingComment(null);
                        setCommentContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit">
                    {editingComment ? 'Update Comment' : 'Post Comment'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="alert alert-info">
                <Link to="/login">Login</Link> or <Link to="/register">register</Link> to leave a comment.
              </div>
            )}
            
            {comments.length === 0 ? (
              <div className="text-center my-5">
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div>
                {comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <Avatar 
                      userId={comment.userId} 
                      name={comment.author} 
                      size="md" 
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <div className="comment-header">
                        <div className="comment-author">{comment.author}</div>
                        <div className="comment-date">{formatDate(comment.createdAt)}</div>
                        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                          <div className="comment-date ml-2">(edited)</div>
                        )}
                      </div>
                      <div className="comment-body">{comment.content}</div>
                      
                      <div className="mt-2">
                        {canEditComment(comment.userId) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mr-2"
                            onClick={() => handleEditComment(comment)}
                          >
                            Edit
                          </Button>
                        )}
                        
                        {canDeleteComment(comment.userId) && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </article>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Article"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteArticle}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this article? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

// Login page component
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from query params
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/';
  
  // Form state and validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useForm(
    { email: '', password: '' },
    (values) => {
      const errors = {};
      
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email is invalid';
      }
      
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      return errors;
    }
  );
  
  // Handle form submission
  const onSubmit = (values, done) => {
    const success = login(values.email, values.password);
    
    if (success) {
      navigate(redirectPath);
    } else {
      done();
      // Show error message
      alert('Invalid email or password');
    }
  };
  
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card title="Login to Your Account" className="mt-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input 
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
                required
              />
              
              <Input 
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                required
              />
              
              <Button 
                type="submit" 
                className="w-100 mt-3" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Login'}
              </Button>
            </form>
            
            <div className="text-center mt-3">
              <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Register page component
const RegisterPage = () => {
  const { register, settings } = useAppContext();
  const navigate = useNavigate();
  
  // Check if registration is allowed
  if (!settings.allowRegistration) {
    return (
      <div className="container text-center my-5">
        <h2>Registration is Disabled</h2>
        <p>We're currently not accepting new registrations. Please contact the administrator for more information.</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }
  
  // Form state and validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    (values) => {
      const errors = {};
      
      if (!values.name) {
        errors.name = 'Name is required';
      }
      
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email is invalid';
      }
      
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      return errors;
    }
  );
  
  // Handle form submission
  const onSubmit = (values, done) => {
    const { confirmPassword, ...userData } = values;
    const success = register(userData);
    
    if (success) {
      navigate('/');
    } else {
      done();
      // Show error message
      alert('Email already in use');
    }
  };
  
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card title="Create a New Account" className="mt-5">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input 
                label="Name"
                name="name"
                placeholder="Enter your name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                touched={touched.name}
                required
              />
              
              <Input 
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
                required
              />
              
              <Input 
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
                required
              />
              
              <Input 
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
                required
              />
              
              <Button 
                type="submit" 
                className="w-100 mt-3" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Register'}
              </Button>
            </form>
            
            <div className="text-center mt-3">
              <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Profile page component
const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useAppContext();
  
  // Form state and validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useForm(
    { 
      name: currentUser.name, 
      email: currentUser.email,
      bio: currentUser.bio || '',
      password: '',
      confirmPassword: '' 
    },
    (values) => {
      const errors = {};
      
      if (!values.name) {
        errors.name = 'Name is required';
      }
      
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email is invalid';
      }
      
      if (values.password && values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (values.password && values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      return errors;
    }
  );
  
  // Handle form submission
  const onSubmit = (values, done) => {
    const { confirmPassword, ...userData } = values;
    
    // Only include password if provided
    const updatedUser = {
      name: userData.name,
      email: userData.email,
      bio: userData.bio
    };
    
    if (userData.password) {
      updatedUser.password = userData.password;
    }
    
    updateUserProfile(updatedUser);
    done();
  };
  
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4">
          <Card className="mt-4">
            <div className="text-center">
              <Avatar 
                userId={currentUser.id} 
                name={currentUser.name} 
                size="xl" 
                className="mb-3"
              />
              <h3>{currentUser.name}</h3>
              <p className="text-muted">{currentUser.email}</p>
              <div className={`role-badge role-${currentUser.role}`}>
                {getRoleDisplayName(currentUser.role)}
              </div>
              
              {currentUser.bio && (
                <div className="mt-3">
                  <h5>Bio</h5>
                  <p>{currentUser.bio}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        
        <div className="col-md-8">
          <Card title="Edit Profile" className="mt-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input 
                label="Name"
                name="name"
                placeholder="Enter your name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.name}
                touched={touched.name}
                required
              />
              
              <Input 
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
                required
              />
              
              <Textarea 
                label="Bio"
                name="bio"
                placeholder="Tell us about yourself"
                value={values.bio}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.bio}
                touched={touched.bio}
              />
              
              <hr className="my-4" />
              
              <h5>Change Password</h5>
              <p className="text-muted mb-3">Leave blank to keep current password</p>
              
              <Input 
                label="New Password"
                name="password"
                type="password"
                placeholder="Enter new password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                touched={touched.password}
              />
              
              <Input 
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />
              
              <Button 
                type="submit" 
                className="mt-3" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Save Changes'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

// My Articles page component
const MyArticlesPage = () => {
  const { articles, deleteArticle } = useAppContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;
  
  // Filter user's articles
  const userArticles = useMemo(() => {
    if (!currentUser) return [];
    
    return articles
      .filter(article => article.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [articles, currentUser]);
  
  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = userArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(userArticles.length / articlesPerPage);
  
  // Handle article deletion
  const handleDeleteArticle = () => {
    if (articleToDelete) {
      deleteArticle(articleToDelete.id);
      setDeleteModalOpen(false);
      setArticleToDelete(null);
    }
  };
  
  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Articles</h1>
        <Button onClick={() => navigate('/articles/new')}>New Article</Button>
      </div>
      
      {userArticles.length === 0 ? (
        <div className="text-center my-5">
          <h3>No articles found</h3>
          <p>You haven't published any articles yet.</p>
          <Button onClick={() => navigate('/articles/new')}>Create Your First Article</Button>
        </div>
      ) : (
        <>
          <Card>
            <Table
              headers={['Title', 'Created', 'Views', 'Likes', 'Actions']}
              data={currentArticles}
              renderRow={(article) => (
                <tr key={article.id}>
                  <td>
                    <Link to={`/articles/${article.id}`}>{article.title}</Link>
                  </td>
                  <td>{formatDate(article.createdAt)}</td>
                  <td>{article.views}</td>
                  <td>{article.likes}</td>
                  <td>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => navigate(`/articles/${article.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => {
                        setArticleToDelete(article);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              )}
            />
          </Card>
          
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </>
      )}
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setArticleToDelete(null);
        }}
        title="Delete Article"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => {
                setDeleteModalOpen(false);
                setArticleToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteArticle}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

// Tag page component
const TagsPage = () => {
  const { tags, articles, PERMISSIONS, canManageTags, deleteTag, updateTag } = useAppContext();
  const { hasPermission } = useAuth();
  const [selectedTag, setSelectedTag] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  
  // Sort tags by count (popularity)
  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => b.count - a.count);
  }, [tags]);
  
  // Group tags by first letter
  const groupedTags = useMemo(() => {
    const groups = {};
    
    sortedTags.forEach(tag => {
      const firstLetter = tag.name.charAt(0).toUpperCase();
      
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      
      groups[firstLetter].push(tag);
    });
    
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [sortedTags]);
  
  // Get article count for a tag
  const getArticleCountForTag = useCallback((tagName) => {
    return articles.filter(article => article.tags.includes(tagName)).length;
  }, [articles]);
  
  // Handle tag edit
  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setNewTagName(tag.name);
    setIsEditModalOpen(true);
  };
  
  // Handle tag delete
  const handleDeleteTagClick = (tag) => {
    setSelectedTag(tag);
    setIsDeleteModalOpen(true);
  };
  
  // Update tag
  const handleUpdateTag = () => {
    if (selectedTag && newTagName) {
      updateTag(selectedTag.id, newTagName);
      setIsEditModalOpen(false);
    }
  };
  
  // Delete tag
  const handleDeleteTag = () => {
    if (selectedTag) {
      deleteTag(selectedTag.id);
      setIsDeleteModalOpen(false);
    }
  };
  
  return (
    <div className="container">
      <h1 className="mb-4">Tags</h1>
      
      <div className="row">
        <div className="col-md-3">
          <Card title="Popular Tags">
            <ul className="list-unstyled">
              {sortedTags.slice(0, 10).map(tag => (
                <li key={tag.id} className="mb-2">
                  <Link to={`/?tag=${tag.name}`} className="d-flex justify-content-between align-items-center">
                    <span>{tag.name}</span>
                    <Badge>{getArticleCountForTag(tag.name)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        
        <div className="col-md-9">
          {groupedTags.map(([letter, tags]) => (
            <div key={letter} className="mb-4">
              <h3>{letter}</h3>
              <hr />
              
              <div className="d-flex flex-wrap">
                {tags.map(tag => (
                  <div key={tag.id} className="mr-2 mb-2 d-flex align-items-center">
                    <Link 
                      to={`/?tag=${tag.name}`} 
                      className="badge badge-primary p-2"
                    >
                      {tag.name} ({getArticleCountForTag(tag.name)})
                    </Link>
                    
                    {canManageTags() && (
                      <div className="ml-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mr-1 p-1"
                          onClick={() => handleEditTag(tag)}
                        >
                          ✏️
                        </Button>
                        
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="p-1"
                          onClick={() => handleDeleteTagClick(tag)}
                        >
                          🗑️
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Edit Tag Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Tag"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateTag}>
              Save
            </Button>
          </>
        }
      >
        <Input 
          label="Tag Name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          required
        />
      </Modal>
      
      {/* Delete Tag Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Tag"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteTag}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the tag "{selectedTag?.name}"? This will remove it from all articles.</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

// Article editor component
const ArticleEditor = ({ initialValues = {}, onSubmit, isEditing = false }) => {
  const { tags } = useAppContext();
  const [preview, setPreview] = useState(false);
  
  // Extract tag names from tag objects
  const tagSuggestions = useMemo(() => {
    return tags.map(tag => tag.name);
  }, [tags]);
  
  // Form state and validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setValues
  } = useForm(
    { 
      title: initialValues.title || '', 
      content: initialValues.content || '',
      tags: initialValues.tags || []
    },
    (values) => {
      const errors = {};
      
      if (!values.title) {
        errors.title = 'Title is required';
      }
      
      if (!values.content) {
        errors.content = 'Content is required';
      }
      
      if (!values.tags || values.tags.length === 0) {
        errors.tags = 'At least one tag is required';
      }
      
      return errors;
    }
  );
  
  // Handle tag change
  const handleTagChange = (newTags) => {
    setValues({
      ...values,
      tags: newTags
    });
  };
  
  // Parse markdown for preview
  const parsedContent = preview ? parseMarkdown(values.content) : '';
  
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input 
          label="Title"
          name="title"
          placeholder="Enter article title"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.title}
          touched={touched.title}
          required
        />
        
        <div className="form-group">
          <label className="form-label">
            Content
            <span className="text-danger ml-1">*</span>
          </label>
          
          <div className="d-flex justify-content-end mb-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setPreview(!preview)}
            >
              {preview ? 'Edit' : 'Preview'}
            </Button>
          </div>
          
          {preview ? (
            <div 
              className="border rounded p-3" 
              style={{ minHeight: '300px' }}
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <Textarea
              name="content"
              placeholder="Write your article content using Markdown"
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.content}
              touched={touched.content}
              rows={15}
              required
            />
          )}
          
          {touched.content && errors.content && (
            <div className="text-danger mt-1">{errors.content}</div>
          )}
        </div>
        
        <div className="form-group">
          <label className="form-label">
            Tags
            <span className="text-danger ml-1">*</span>
          </label>
          
          <TagInput 
            value={values.tags}
            onChange={handleTagChange}
            suggestions={tagSuggestions}
          />
          
          {touched.tags && errors.tags && (
            <div className="text-danger mt-1">{errors.tags}</div>
          )}
        </div>
        
        <div className="d-flex justify-content-between mt-4">
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner size="sm" /> : isEditing ? 'Update Article' : 'Publish Article'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Create article page component
const CreateArticlePage = () => {
  const { addArticle, addTag, incrementTagCount } = useAppContext();
  const navigate = useNavigate();
  
  // Handle form submission
  const handleSubmit = (values, done) => {
    // Add new tags and increment existing tag counts
    values.tags.forEach(tag => {
      // Try to add tag (will only add if it doesn't exist)
      const added = addTag(tag);
      
      // If tag already exists, increment its count
      if (!added) {
        incrementTagCount(tag);
      }
    });
    
    // Add article
    const articleId = addArticle(values);
    
    // Redirect to the new article
    navigate(`/articles/${articleId}`);
  };
  
  return (
    <div className="container">
      <h1 className="mb-4">Create New Article</h1>
      
      <Card>
        <ArticleEditor onSubmit={handleSubmit} />
      </Card>
    </div>
  );
};

// Edit article page component
const EditArticlePage = () => {
  const { id } = useParams();
  const { 
    getArticleById, 
    updateArticle, 
    addTag, 
    incrementTagCount, 
    decrementTagCount 
  } = useAppContext();
  const navigate = useNavigate();
  
  const article = getArticleById(id);
  
  // Handle article not found
  if (!article) {
    return (
      <div className="container text-center my-5">
        <h2>Article not found</h2>
        <p>The article you're trying to edit doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }
  
  // Handle form submission
  const handleSubmit = (values, done) => {
    // Keep track of original tags for comparison
    const originalTags = [...article.tags];
    const newTags = [...values.tags];
    
    // Find tags that were removed
    const removedTags = originalTags.filter(tag => !newTags.includes(tag));
    
    // Find tags that were added
    const addedTags = newTags.filter(tag => !originalTags.includes(tag));
    
    // Update tag counts
    removedTags.forEach(tag => decrementTagCount(tag));
    
    addedTags.forEach(tag => {
      // Try to add tag (will only add if it doesn't exist)
      const added = addTag(tag);
      
      // If tag already exists, increment its count
      if (!added) {
        incrementTagCount(tag);
      }
    });
    
    // Update article
    updateArticle(article.id, values);
    
    // Redirect to the updated article
    navigate(`/articles/${article.id}`);
  };
  
  return (
    <div className="container">
      <h1 className="mb-4">Edit Article</h1>
      
      <Card>
        <ArticleEditor 
          initialValues={article} 
          onSubmit={handleSubmit} 
          isEditing={true} 
        />
      </Card>
    </div>
  );
};

// Admin Dashboard component
const AdminDashboard = () => {
  const { getStats, PERMISSIONS } = useAppContext();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get stats
  const stats = getStats();
  
  return (
    <div className="container">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalArticles}</div>
          <div className="stat-label">Articles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalComments}</div>
          <div className="stat-label">Comments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.articleViews}</div>
          <div className="stat-label">Total Views</div>
        </div>
      </div>
      
      <div className="admin-tabs">
        <div 
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </div>
        
        {hasPermission(PERMISSIONS.MANAGE_USERS) && (
          <div 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </div>
        )}
        
        <div 
          className={`admin-tab ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveTab('articles')}
        >
          Articles
        </div>
        
        {hasPermission(PERMISSIONS.MANAGE_ROLES) && (
          <div 
            className={`admin-tab ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            Roles & Permissions
          </div>
        )}
        
        {hasPermission(PERMISSIONS.MANAGE_SETTINGS) && (
          <div 
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </div>
        )}
      </div>
      
      <div className="mt-4">
        {activeTab === 'overview' && <AdminOverview stats={stats} />}
        {activeTab === 'users' && hasPermission(PERMISSIONS.MANAGE_USERS) && <AdminUsers />}
        {activeTab === 'articles' && <AdminArticles />}
        {activeTab === 'roles' && hasPermission(PERMISSIONS.MANAGE_ROLES) && <AdminRoles />}
        {activeTab === 'settings' && hasPermission(PERMISSIONS.MANAGE_SETTINGS) && <AdminSettings />}
      </div>
    </div>
  );
};

// Admin Overview component
const AdminOverview = ({ stats }) => {
  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-6">
          <Card title="Top Articles">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Views</th>
                    <th>Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topArticles.map(article => (
                    <tr key={article.id}>
                      <td><Link to={`/articles/${article.id}`}>{article.title}</Link></td>
                      <td>{article.views}</td>
                      <td>{article.likes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        <div className="col-md-6">
          <Card title="Top Authors">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Articles</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topAuthors.map(author => (
                    <tr key={author.id}>
                      <td>{author.name}</td>
                      <td>{author.articlesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
      
      <Card title="Popular Tags">
        <div className="d-flex flex-wrap">
          {stats.popularTags.map(tag => (
            <Link key={tag.id} to={`/?tag=${tag.name}`} className="badge badge-primary mr-2 mb-2 p-2">
              {tag.name} ({tag.count})
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Admin Users component
const AdminUsers = () => {
  const { users, updateUserRole, addUser, updateUser, deleteUser, rolePermissions, ROLES } = useAppContext();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const usersPerPage = 10;
  
  // Form state
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    resetForm
  } = useForm(
    { 
      name: '', 
      email: '',
      password: '',
      role: ROLES.READER
    },
    (values) => {
      const errors = {};
      
      if (!values.name) {
        errors.name = 'Name is required';
      }
      
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email is invalid';
      }
      
      if (!isEditing && !values.password) {
        errors.password = 'Password is required';
      } else if (values.password && values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      return errors;
    }
  );
  
  // Reset form when modal closes
  useEffect(() => {
    if (!userModalOpen) {
      resetForm();
      setIsEditing(false);
      setSelectedUser(null);
    }
  }, [userModalOpen, resetForm]);
  
  // Sort users by join date (newest first)
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [users]);
  
  // Filter users by search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return sortedUsers;
    
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    return sortedUsers.filter(
      user => 
        user.name.toLowerCase().includes(lowercaseSearchTerm) ||
        user.email.toLowerCase().includes(lowercaseSearchTerm) ||
        user.role.toLowerCase().includes(lowercaseSearchTerm)
    );
  }, [sortedUsers, searchTerm]);
  
  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Handle role change
  const handleRoleChange = (userId, role) => {
    updateUserRole(userId, role);
  };
  
  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    resetForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setUserModalOpen(true);
  };
  
  // Handle delete user click
  const handleDeleteUserClick = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };
  
  // Handle form submission
  const handleFormSubmit = (values, done) => {
    if (isEditing && selectedUser) {
      // Update user
      const userData = { ...values };
      if (!userData.password) delete userData.password;
      
      updateUser(selectedUser.id, userData);
    } else {
      // Add new user
      addUser(values);
    }
    
    done();
    setUserModalOpen(false);
  };
  
  // Handle delete user
  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setDeleteModalOpen(false);
    }
  };
  
  // Available roles for dropdown
  const roleOptions = Object.keys(rolePermissions).map(role => ({
    value: role,
    label: getRoleDisplayName(role)
  }));
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Users</h2>
        <Button onClick={() => setUserModalOpen(true)}>Add New User</Button>
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Card>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <Avatar 
                        userId={user.id} 
                        name={user.name} 
                        size="sm"
                        className="mr-2"
                      />
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      options={roleOptions}
                    />
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteUserClick(user)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
      
      {/* User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={isEditing ? 'Edit User' : 'Add New User'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setUserModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="userForm"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner size="sm" /> : isEditing ? 'Update User' : 'Add User'}
            </Button>
          </>
        }
      >
        <form id="userForm" onSubmit={handleSubmit(handleFormSubmit)}>
          <Input 
            label="Name"
            name="name"
            placeholder="Enter name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            touched={touched.name}
            required
          />
          
          <Input 
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            required
          />
          
          <Input 
            label={isEditing ? 'Password (leave blank to keep current)' : 'Password'}
            name="password"
            type="password"
            placeholder={isEditing ? 'Enter new password' : 'Enter password'}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touched.password}
            required={!isEditing}
          />
          
          <Select 
            label="Role"
            name="role"
            value={values.role}
            onChange={handleChange}
            onBlur={handleBlur}
            options={roleOptions}
          />
        </form>
      </Modal>
      
      {/* Delete User Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the user "{selectedUser?.name}"?</p>
        <p>This will also delete all articles and comments created by this user. This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

// Admin Articles component
const AdminArticles = () => {
  const { articles, deleteArticle } = useAppContext();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const articlesPerPage = 10;
  
  // Sort articles by date (newest first)
  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [articles]);
  
  // Get unique tags and authors for filters
  const uniqueTags = useMemo(() => {
    const allTags = [];
    articles.forEach(article => {
      article.tags.forEach(tag => {
        if (!allTags.includes(tag)) {
          allTags.push(tag);
        }
      });
    });
    return allTags.sort();
  }, [articles]);
  
  const uniqueAuthors = useMemo(() => {
    const authors = new Set();
    articles.forEach(article => {
      authors.add(article.author);
    });
    return Array.from(authors).sort();
  }, [articles]);
  
  // Filter articles
  const filteredArticles = useMemo(() => {
    return sortedArticles.filter(article => {
      // Filter by search term
      if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by tag
      if (filterTag && !article.tags.includes(filterTag)) {
        return false;
      }
      
      // Filter by author
      if (filterAuthor && article.author !== filterAuthor) {
        return false;
      }
      
      return true;
    });
  }, [sortedArticles, searchTerm, filterTag, filterAuthor]);
  
  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  
  // Handle delete article click
  const handleDeleteArticleClick = (article) => {
    setSelectedArticle(article);
    setDeleteModalOpen(true);
  };
  
  // Handle delete article
  const handleDeleteArticle = () => {
    if (selectedArticle) {
      deleteArticle(selectedArticle.id);
      setDeleteModalOpen(false);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterTag('');
    setFilterAuthor('');
    setCurrentPage(1);
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Articles</h2>
        <div>
          <Button 
            variant="secondary" 
            className="mr-2"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
          <Button onClick={() => navigate('/articles/new')}>Add New Article</Button>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <Select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            options={[
              { value: '', label: 'All Tags' },
              ...uniqueTags.map(tag => ({ value: tag, label: tag }))
            ]}
          />
        </div>
        <div className="col-md-4">
          <Select
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            options={[
              { value: '', label: 'All Authors' },
              ...uniqueAuthors.map(author => ({ value: author, label: author }))
            ]}
          />
        </div>
      </div>
      
      <Card>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Created</th>
                <th>Tags</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentArticles.map(article => (
                <tr key={article.id}>
                  <td>
                    <Link to={`/articles/${article.id}`}>{article.title}</Link>
                  </td>
                  <td>{article.author}</td>
                  <td>{formatDate(article.createdAt)}</td>
                  <td>
                    <div className="d-flex flex-wrap">
                      {article.tags.map(tag => (
                        <span key={tag} className="badge badge-primary mr-1 mb-1">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td>{article.views}</td>
                  <td>{article.likes}</td>
                  <td>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => navigate(`/articles/${article.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteArticleClick(article)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              
              {currentArticles.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-3">
                    No articles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}
      
      {/* Delete Article Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Article"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteArticle}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the article "{selectedArticle?.title}"?</p>
        <p>This will also delete all comments on this article. This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

// Admin Roles component
const AdminRoles = () => {
  const { rolePermissions, PERMISSIONS, createRole, updateRolePermissions, deleteRole } = useAppContext();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // All available permissions
  const allPermissions = Object.values(PERMISSIONS);
  
  // Group permissions by category
  const permissionCategories = {
    'Articles': [
      PERMISSIONS.CREATE_ARTICLE,
      PERMISSIONS.EDIT_ANY_ARTICLE,
      PERMISSIONS.EDIT_OWN_ARTICLE,
      PERMISSIONS.DELETE_ANY_ARTICLE,
      PERMISSIONS.DELETE_OWN_ARTICLE
    ],
    'Comments': [
      PERMISSIONS.CREATE_COMMENT,
      PERMISSIONS.EDIT_ANY_COMMENT,
      PERMISSIONS.EDIT_OWN_COMMENT,
      PERMISSIONS.DELETE_ANY_COMMENT,
      PERMISSIONS.DELETE_OWN_COMMENT
    ],
    'Administration': [
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_ROLES,
      PERMISSIONS.MANAGE_TAGS,
      PERMISSIONS.MANAGE_SETTINGS
    ]
  };
  
  // Reset form when modal closes
  useEffect(() => {
    if (!roleModalOpen) {
      setRoleName('');
      setSelectedPermissions([]);
      setIsEditing(false);
      setSelectedRole('');
    }
  }, [roleModalOpen]);
  
  // Handle permission toggle
  const handlePermissionToggle = (permission) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };
  
  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update role permissions
      updateRolePermissions(selectedRole, selectedPermissions);
    } else {
      // Create new role
      createRole(roleName, selectedPermissions);
    }
    
    setRoleModalOpen(false);
  };
  
  // Handle edit role
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setRoleName(role);
    setSelectedPermissions(rolePermissions[role] || []);
    setIsEditing(true);
    setRoleModalOpen(true);
  };
  
  // Handle delete role click
  const handleDeleteRoleClick = (role) => {
    setSelectedRole(role);
    setDeleteModalOpen(true);
  };
  
  // Handle delete role
  const handleDeleteRole = () => {
    if (selectedRole) {
      deleteRole(selectedRole);
      setDeleteModalOpen(false);
    }
  };
  
  // Get permission display name
  const getPermissionDisplayName = (permission) => {
    return permission
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Roles & Permissions</h2>
        <Button onClick={() => setRoleModalOpen(true)}>Add New Role</Button>
      </div>
      
      <div className="row">
        {Object.keys(rolePermissions).map(role => (
          <div key={role} className="col-md-6 mb-4">
            <Card>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className={`role-badge role-${role}`}>{getRoleDisplayName(role)}</h3>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => handleEditRole(role)}
                  >
                    Edit
                  </Button>
                  
                  {/* Don't allow deleting core roles */}
                  {!['admin', 'writer', 'reader'].includes(role) && (
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteRoleClick(role)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
              
              <div>
                <h5>Permissions:</h5>
                <ul className="list-unstyled">
                  {rolePermissions[role]?.map(permission => (
                    <li key={permission} className="mb-1">
                      <span className="text-success mr-2">✓</span>
                      {getPermissionDisplayName(permission)}
                    </li>
                  ))}
                  
                  {rolePermissions[role]?.length === 0 && (
                    <li className="text-muted">No permissions assigned</li>
                  )}
                </ul>
              </div>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Role Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={isEditing ? `Edit Role: ${getRoleDisplayName(selectedRole)}` : 'Add New Role'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="roleForm">
              {isEditing ? 'Update Role' : 'Add Role'}
            </Button>
          </>
        }
      >
        <form id="roleForm" onSubmit={handleFormSubmit}>
          {!isEditing && (
            <Input 
              label="Role Name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
              required
            />
          )}
          
          <div className="mt-3">
            <label className="form-label">Permissions</label>
            
            {Object.entries(permissionCategories).map(([category, permissions]) => (
              <div key={category} className="mb-3">
                <h5>{category}</h5>
                
                {permissions.map(permission => (
                  <div key={permission} className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={permission}
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => handlePermissionToggle(permission)}
                    />
                    <label className="form-check-label" htmlFor={permission}>
                      {getPermissionDisplayName(permission)}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </form>
      </Modal>
      
      {/* Delete Role Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Role"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteRole}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the role "{getRoleDisplayName(selectedRole)}"?</p>
        <p>Users with this role will be changed to the default Reader role. This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

// Admin Settings component
const AdminSettings = () => {
  const { settings, updateSettings, ROLES } = useAppContext();
  
  // Form state
  const {
    values,
    handleChange,
    handleSubmit,
    isSubmitting
  } = useForm(
    { ...settings },
    () => ({})
  );
  
  // Handle form submission
  const onSubmit = (values, done) => {
    updateSettings(values);
    done();
  };
  
  // Role options for default user role
  const roleOptions = Object.keys(ROLES).map(role => ({
    value: ROLES[role],
    label: getRoleDisplayName(ROLES[role])
  }));
  
  return (
    <div>
      <h2 className="mb-4">Site Settings</h2>
      
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-6">
              <Input 
                label="Site Name"
                name="siteName"
                value={values.siteName}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-md-6">
              <Input 
                label="Logo URL"
                name="logoUrl"
                value={values.logoUrl}
                onChange={handleChange}
                placeholder="Leave blank to use site name"
              />
            </div>
          </div>
          
          <Textarea 
            label="Site Description"
            name="siteDescription"
            value={values.siteDescription}
            onChange={handleChange}
          />
          
          <div className="row">
            <div className="col-md-6">
              <Checkbox 
                label="Allow User Registration"
                name="allowRegistration"
                checked={values.allowRegistration}
                onChange={(e) => handleChange({
                  target: {
                    name: 'allowRegistration',
                    value: e.target.checked
                  }
                })}
              />
            </div>
            
            <div className="col-md-6">
              <Checkbox 
                label="Require Email Verification"
                name="requireEmailVerification"
                checked={values.requireEmailVerification}
                onChange={(e) => handleChange({
                  target: {
                    name: 'requireEmailVerification',
                    value: e.target.checked
                  }
                })}
              />
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <Checkbox 
                label="Enable Comments"
                name="enableComments"
                checked={values.enableComments}
                onChange={(e) => handleChange({
                  target: {
                    name: 'enableComments',
                    value: e.target.checked
                  }
                })}
              />
            </div>
            
            <div className="col-md-6">
              <Input 
                label="Articles Per Page"
                name="articlesPerPage"
                type="number"
                min="1"
                max="50"
                value={values.articlesPerPage}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <Select 
            label="Default User Role"
            name="defaultUserRole"
            value={values.defaultUserRole}
            onChange={handleChange}
            options={roleOptions}
          />
          
          <Button 
            type="submit" 
            className="mt-3" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner size="sm" /> : 'Save Settings'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

// Not found page component
const NotFoundPage = () => {
  return (
    <div className="container text-center my-5">
      <h1 className="display-1">404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
    </div>
  );
};

// ==============================================
// SAMPLE DATA
// ==============================================

// Sample users
const sampleUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Writer User',
    email: 'writer@example.com',
    password: 'password123',
    role: 'writer',
    createdAt: '2023-01-02T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Editor User',
    email: 'editor@example.com',
    password: 'password123',
    role: 'editor',
    createdAt: '2023-01-02T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Moderator User',
    email: 'moderator@example.com',
    password: 'password123',
    role: 'moderator',
    createdAt: '2023-01-03T00:00:00.000Z'
  },
  {
    id: '5',
    name: 'Reader User',
    email: 'reader@example.com',
    password: 'password123',
    role: 'reader',
    createdAt: '2023-01-03T00:00:00.000Z'
  }
];

// Sample articles
const sampleArticles = [
  {
    id: '1',
    title: 'Getting Started with React',
    content: `
# Getting Started with React

React is a popular JavaScript library for building user interfaces. Here's how to get started with React.

## Prerequisites

Before you begin, make sure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

## Creating a React App

The easiest way to create a React application is by using Create React App, a tool that sets up a new React project with a good default configuration.

\`\`\`bash
npx create-react-app my-app
cd my-app
npm start
\`\`\`

This will create a new React project called "my-app" and start the development server.

## React Components

Components are the building blocks of React applications. Here's a simple component:

\`\`\`jsx
import React from 'react';

function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

export default Greeting;
\`\`\`

## Using Components

You can use the component in another component like this:

\`\`\`jsx
import React from 'react';
import Greeting from './Greeting';

function App() {
  return (
    <div>
      <Greeting name="World" />
    </div>
  );
}

export default App;
\`\`\`

## State and Hooks

React provides hooks to add state and other React features to functional components.

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Next Steps

Now that you have a basic understanding of React, you can:

1. Learn more about [React hooks](https://reactjs.org/docs/hooks-intro.html)
2. Explore [React Router](https://reactrouter.com/) for handling routing
3. Check out [
Redux](https://redux.js.org/) for state management
4. Learn about [server-side rendering](https://nextjs.org/) with Next.js

Happy coding!
    `,
    tags: ['React', 'JavaScript', 'Frontend'],
    userId: '2',
    author: 'Writer User',
    createdAt: '2023-02-01T00:00:00.000Z',
    updatedAt: '2023-02-01T00:00:00.000Z',
    likes: 15,
    views: 120
  },
  {
    id: '2',
    title: 'Advanced TypeScript Features',
    content: `
# Advanced TypeScript Features

TypeScript is a powerful superset of JavaScript that adds static types. Let's explore some advanced features.

## Generic Types

Generics allow you to create reusable components that work with a variety of types.

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

let output = identity<string>("myString");  // type of output will be 'string'
\`\`\`

## Type Inference

TypeScript can infer types in many cases, making your code cleaner.

\`\`\`typescript
// TypeScript infers the return type as number
function add(a: number, b: number) {
  return a + b;
}
\`\`\`

## Union Types

Union types allow a value to be one of several types.

\`\`\`typescript
function formatInput(input: string | number) {
  if (typeof input === "string") {
    return input.trim();
  }
  return input.toFixed(2);
}
\`\`\`

## Intersection Types

Intersection types combine multiple types into one.

\`\`\`typescript
interface Person {
  name: string;
  age: number;
}

interface Employee {
  companyId: string;
  role: string;
}

type EmployeeInfo = Person & Employee;

const employee: EmployeeInfo = {
  name: "John",
  age: 30,
  companyId: "E123",
  role: "Developer"
};
\`\`\`

## Utility Types

TypeScript provides several utility types to facilitate common type transformations.

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Exclude password for public API
type PublicUser = Omit<User, "password">;

// Make all properties optional for updates
type UpdateUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Extract only id and name
type BasicUser = Pick<User, "id" | "name">;
\`\`\`

## Conditional Types

Conditional types select one of two possible types based on a condition.

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
\`\`\`

## Mapped Types

Mapped types transform properties of an existing type.

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface Point {
  x: number;
  y: number;
}

const readonlyPoint: Readonly<Point> = { x: 10, y: 20 };
// readonlyPoint.x = 5;  // Error: Cannot assign to 'x' because it is a read-only property
\`\`\`

TypeScript offers many more advanced features, but these should give you a good starting point for writing more robust code.
    `,
    tags: ['TypeScript', 'JavaScript', 'Programming'],
    userId: '1',
    author: 'Admin User',
    createdAt: '2023-02-15T00:00:00.000Z',
    updatedAt: '2023-02-16T00:00:00.000Z',
    likes: 28,
    views: 230
  },
  {
    id: '3',
    title: 'Testing React Applications with Jest and React Testing Library',
    content: `
# Testing React Applications with Jest and React Testing Library

Testing is a crucial part of developing reliable React applications. In this article, we'll explore how to test React components using Jest and React Testing Library.

## Setting Up

If you're using Create React App, Jest and React Testing Library are already set up for you. Otherwise, you can install them:

\`\`\`bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
\`\`\`

## Writing Your First Test

Let's create a simple component and test it:

\`\`\`jsx
// Button.js
import React from 'react';

function Button({ onClick, children }) {
  return (
    <button onClick={onClick} className="custom-button">
      {children}
    </button>
  );
}

export default Button;
\`\`\`

Now, let's write a test for this component:

\`\`\`jsx
// Button.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  const buttonElement = screen.getByText(/click me/i);
  expect(buttonElement).toBeInTheDocument();
});

test('calls onClick when button is clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  const buttonElement = screen.getByText(/click me/i);
  fireEvent.click(buttonElement);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
\`\`\`

## Testing Async Operations

React Testing Library provides utilities for testing asynchronous operations:

\`\`\`jsx
// UserData.js
import React, { useState, useEffect } from 'react';

function UserData({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const data = await response.json();
        setUser(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>User Details</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}

export default UserData;
\`\`\`

Testing the async component:

\`\`\`jsx
// UserData.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserData from './UserData';

// Mock fetch
global.fetch = jest.fn();

test('displays user data after successful fetch', async () => {
  const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
  
  fetch.mockResolvedValueOnce({
    json: async () => mockUser,
  });

  render(<UserData userId={1} />);
  
  // Initial loading state
  expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  
  // Wait for user data to be displayed
  await waitFor(() => {
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });
  
  expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
});

test('displays error message when user not found', async () => {
  fetch.mockResolvedValueOnce({
    json: async () => null,
  });

  render(<UserData userId={999} />);
  
  // Wait for error message
  await waitFor(() => {
    expect(screen.getByText(/user not found/i)).toBeInTheDocument();
  });
});
\`\`\`

## Testing Custom Hooks

You can test custom hooks using the \`@testing-library/react-hooks\` package:

\`\`\`jsx
// useCounter.js
import { useState } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

export default useCounter;
\`\`\`

Testing the hook:

\`\`\`jsx
// useCounter.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import useCounter from './useCounter';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});

test('should decrement counter', () => {
  const { result } = renderHook(() => useCounter(10));
  
  act(() => {
    result.current.decrement();
  });
  
  expect(result.current.count).toBe(9);
});

test('should reset counter', () => {
  const { result } = renderHook(() => useCounter(10));
  
  act(() => {
    result.current.increment();
    result.current.reset();
  });
  
  expect(result.current.count).toBe(10);
});
\`\`\`

## Best Practices

1. Test behavior, not implementation details
2. Prefer user-centric queries (getByRole, getByText) over implementation-specific queries (getByTestId)
3. Make your tests resemble how users interact with your app
4. Use mocks sparingly and explicitly
5. Keep your tests simple and focused

By following these practices, you'll create a robust test suite that gives you confidence in your React application's reliability.
    `,
    tags: ['React', 'Testing', 'Jest', 'JavaScript'],
    userId: '2',
    author: 'Writer User',
    createdAt: '2023-03-05T00:00:00.000Z',
    updatedAt: '2023-03-05T00:00:00.000Z',
    likes: 42,
    views: 310
  },
  {
    id: '4',
    title: 'Introduction to Docker for Web Developers',
    content: `
# Introduction to Docker for Web Developers

Docker has revolutionized how developers build, package, and deploy applications. This guide will introduce Docker concepts for web developers.

## What is Docker?

Docker is a platform that allows you to develop, deploy, and run applications in containers. Unlike virtual machines, containers are lightweight and share the host system's kernel.

## Key Benefits

- **Consistency**: Works the same across all environments
- **Isolation**: Applications run in isolated environments
- **Efficiency**: Uses fewer resources than VMs
- **Scalability**: Easy to scale horizontally

## Getting Started

First, [install Docker](https://docs.docker.com/get-docker/) for your operating system.

## Basic Docker Concepts

### Images

An image is a read-only template with instructions for creating a Docker container. Think of it as a snapshot of an application and its environment.

### Containers

A container is a runnable instance of an image. You can create, start, stop, move, or delete containers.

### Dockerfile

A Dockerfile is a text document containing all the commands needed to build an image.

## Creating a Dockerfile

Here's a simple Dockerfile for a Node.js application:

\`\`\`dockerfile
# Use Node.js LTS version
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
\`\`\`

## Building and Running an Image

Build your Docker image:

\`\`\`bash
docker build -t my-node-app .
\`\`\`

Run a container from your image:

\`\`\`bash
docker run -p 3000:3000 my-node-app
\`\`\`

## Docker Compose

Docker Compose helps manage multi-container applications. Create a \`docker-compose.yml\` file:

\`\`\`yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: mongo
    volumes:
      - mongodb_data:/data/db
volumes:
  mongodb_data:
\`\`\`

Run your multi-container application:

\`\`\`bash
docker-compose up
\`\`\`

## Best Practices

1. **Use specific image versions**: Avoid using \`latest\` tag
2. **Minimize layers**: Combine RUN commands where possible
3. **Use .dockerignore**: Exclude unnecessary files
4. **Multi-stage builds**: Reduce final image size
5. **Non-root user**: Run containers as non-root when possible

## Debugging Docker Containers

View running containers:

\`\`\`bash
docker ps
\`\`\`

View logs:

\`\`\`bash
docker logs <container_id>
\`\`\`

Execute commands inside the container:

\`\`\`bash
docker exec -it <container_id> bash
\`\`\`

## Conclusion

Docker simplifies development and deployment workflows by ensuring consistency across environments. As a web developer, mastering Docker will make your development process more efficient and deployments more reliable.
    `,
    tags: ['Docker', 'DevOps', 'Web Development'],
    userId: '3',
    author: 'Editor User',
    createdAt: '2023-04-10T00:00:00.000Z',
    updatedAt: '2023-04-10T00:00:00.000Z',
    likes: 35,
    views: 280
  }
];

// Sample comments
const sampleComments = [
  {
    id: '1',
    articleId: '1',
    userId: '5',
    author: 'Reader User',
    content: 'This was very helpful! I\'ve been struggling with React but this makes it clearer.',
    createdAt: '2023-02-02T12:00:00.000Z'
  },
  {
    id: '2',
    articleId: '1',
    userId: '1',
    author: 'Admin User',
    content: 'Great introduction to React. You might want to add a section about hooks in the future.',
    createdAt: '2023-02-03T08:30:00.000Z'
  },
  {
    id: '3',
    articleId: '2',
    userId: '2',
    author: 'Writer User',
    content: 'I\'ve been using TypeScript for a while, but I learned some new tricks from this article!',
    createdAt: '2023-02-16T15:45:00.000Z'
  },
  {
    id: '4',
    articleId: '3',
    userId: '5',
    author: 'Reader User',
    content: 'Testing has always been a pain point for me. This article makes it much more approachable.',
    createdAt: '2023-03-06T10:20:00.000Z'
  },
  {
    id: '5',
    articleId: '3',
    userId: '1',
    author: 'Admin User',
    content: 'Would love to see a follow-up on integration testing with Cypress!',
    createdAt: '2023-03-07T14:10:00.000Z'
  },
  {
    id: '6',
    articleId: '4',
    userId: '4',
    author: 'Moderator User',
    content: 'Docker is a must-know technology these days. Great intro article for beginners!',
    createdAt: '2023-04-11T09:15:00.000Z'
  },
  {
    id: '7',
    articleId: '4',
    userId: '3',
    author: 'Editor User',
    content: 'Thanks for the feedback! I\'m planning a follow-up article on Docker Compose for microservices.',
    createdAt: '2023-04-12T11:30:00.000Z'
  }
];

// Sample tags
const sampleTags = [
  { id: '1', name: 'React', count: 2 },
  { id: '2', name: 'JavaScript', count: 3 },
  { id: '3', name: 'Frontend', count: 1 },
  { id: '4', name: 'TypeScript', count: 1 },
  { id: '5', name: 'Programming', count: 1 },
  { id: '6', name: 'Testing', count: 1 },
  { id: '7', name: 'Jest', count: 1 },
  { id: '8', name: 'Docker', count: 1 },
  { id: '9', name: 'DevOps', count: 1 },
  { id: '10', name: 'Web Development', count: 1 }
];

// ==============================================
// MAIN APP COMPONENT
// ==============================================

const App = () => {
  return (
    <Router>
      <AppProvider>
        <AuthProvider>
          <div className="app">
            <Navbar />
            
            <main className="main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/articles/:id" element={<ArticleDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/about" element={<AboutPage />} />
                
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/my-articles" 
                  element={
                    <ProtectedRoute>
                      <MyArticlesPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/articles/new" 
                  element={
                    <PermissionRoute permission={PERMISSIONS.CREATE_ARTICLE}>
                      <CreateArticlePage />
                    </PermissionRoute>
                  } 
                />
                
                <Route 
                  path="/articles/:id/edit" 
                  element={
                    <PermissionRoute permission={PERMISSIONS.EDIT_OWN_ARTICLE}>
                      <EditArticlePage />
                    </PermissionRoute>
                  } 
                />
                
                <Route 
                  path="/admin" 
                  element={
                    <PermissionRoute permission={PERMISSIONS.MANAGE_USERS}>
                      <AdminDashboard />
                    </PermissionRoute>
                  } 
                />
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            
            <Footer />
            <ToastContainer />
          </div>
        </AuthProvider>
      </AppProvider>
    </Router>
  );
};

// About Page component
const AboutPage = () => {
  const { settings } = useAppContext();
  
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card className="mt-4">
            <h1 className="mb-4">About {settings.siteName}</h1>
            
            <p>{settings.siteDescription}</p>
            
            <h3 className="mt-4">Our Mission</h3>
            <p>
              Our mission is to create a platform where developers and tech enthusiasts can share knowledge, 
              insights, and experiences. We believe in the power of community-driven learning and aim to 
              provide a space for quality technical content.
            </p>
            
            <h3 className="mt-4">Join Our Community</h3>
            <p>
              We welcome contributors of all levels of experience. Whether you're a seasoned developer 
              or just starting your journey in tech, your perspective matters.
            </p>
            
            <div className="mt-4">
              <Link to="/register" className="btn btn-primary">Join Now</Link>
              <Link to="/login" className="btn btn-outline ml-3">Login</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ==============================================
// RENDER THE APP
// ==============================================

// Create a style element for the CSS
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

// Get the root element and render the app
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(<App />);

export default App;