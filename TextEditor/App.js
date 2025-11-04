import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [text, setText] = useState('');
  const [currentFile, setCurrentFile] = useState('Untitled');
  const [fileList, setFileList] = useState([]);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    loadFileList();
  }, []);

  useEffect(() => {
    // Update word and character count
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
    setIsSaved(false);
  }, [text]);

  const loadFileList = async () => {
    try {
      const files = await AsyncStorage.getAllKeys();
      const textFiles = files.filter(file => file.startsWith('file_'));
      setFileList(textFiles.map(file => file.replace('file_', '')));
    } catch (error) {
      console.error('Error loading file list:', error);
    }
  };

  const saveFile = async (filename = currentFile) => {
    try {
      await AsyncStorage.setItem(`file_${filename}`, text);
      setCurrentFile(filename);
      setIsSaved(true);
      Alert.alert('Success', `File "${filename}" saved successfully!`);
      loadFileList();
    } catch (error) {
      Alert.alert('Error', 'Failed to save file');
    }
  };

  const loadFile = async (filename) => {
    try {
      const content = await AsyncStorage.getItem(`file_${filename}`);
      if (content !== null) {
        setText(content);
        setCurrentFile(filename);
        setShowFileManager(false);
        setIsSaved(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load file');
    }
  };

  const createNewFile = () => {
    if (newFileName.trim()) {
      setText('');
      setCurrentFile(newFileName);
      setShowNewFileDialog(false);
      setNewFileName('');
      setIsSaved(false);
    } else {
      Alert.alert('Error', 'Please enter a file name');
    }
  };

  const deleteFile = async (filename) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${filename}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(`file_${filename}`);
              loadFileList();
              Alert.alert('Success', 'File deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    );
  };

  const clearText = () => {
    Alert.alert(
      'Clear Text',
      'Are you sure you want to clear all text?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setText('') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="document-text" size={24} color="#fff" />
          <Text style={styles.headerTitle}>{currentFile}</Text>
          {!isSaved && <Text style={styles.unsavedIndicator}>●</Text>}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowFileManager(true)}
          >
            <Ionicons name="folder-open" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => setShowNewFileDialog(true)}
        >
          <Ionicons name="add-circle" size={20} color="#6366f1" />
          <Text style={styles.toolbarButtonText}>New</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={() => saveFile()}
        >
          <Ionicons name="save" size={20} color="#6366f1" />
          <Text style={styles.toolbarButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toolbarButton}
          onPress={clearText}
        >
          <Ionicons name="trash" size={20} color="#ef4444" />
          <Text style={[styles.toolbarButtonText, {color: '#ef4444'}]}>Clear</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {wordCount} words • {charCount} chars
          </Text>
        </View>
      </View>

      {/* Text Editor */}
      <ScrollView style={styles.editorContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Start typing your text here..."
          placeholderTextColor="#9ca3af"
          textAlignVertical="top"
          autoCapitalize="sentences"
          autoCorrect={true}
        />
      </ScrollView>

      {/* File Manager Modal */}
      <Modal
        visible={showFileManager}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFileManager(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Files</Text>
              <TouchableOpacity onPress={() => setShowFileManager(false)}>
                <Ionicons name="close" size={28} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.fileList}>
              {fileList.length === 0 ? (
                <Text style={styles.emptyText}>No files yet. Create a new file to get started!</Text>
              ) : (
                fileList.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <TouchableOpacity 
                      style={styles.fileItemLeft}
                      onPress={() => loadFile(file)}
                    >
                      <Ionicons name="document" size={24} color="#6366f1" />
                      <Text style={styles.fileName}>{file}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteFile(file)}>
                      <Ionicons name="trash-outline" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* New File Dialog */}
      <Modal
        visible={showNewFileDialog}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowNewFileDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Create New File</Text>
            <TextInput
              style={styles.dialogInput}
              value={newFileName}
              onChangeText={setNewFileName}
              placeholder="Enter file name"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
            <View style={styles.dialogButtons}>
              <TouchableOpacity 
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={() => {
                  setShowNewFileDialog(false);
                  setNewFileName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dialogButton, styles.createButton]}
                onPress={createNewFile}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  unsavedIndicator: {
    color: '#fbbf24',
    fontSize: 20,
    marginLeft: 6,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  toolbarButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statsText: {
    color: '#6b7280',
    fontSize: 12,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
    padding: 16,
    minHeight: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  fileList: {
    maxHeight: 400,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 40,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    fontWeight: '500',
  },
  dialogBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  dialogInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dialogButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#6366f1',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
