import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckCircle, Circle, Inbox, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STORAGE_KEY = "@taskflow_tasks";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from AsyncStorage
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    if (!isLoading) {
      saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      Alert.alert("Error", "Failed to load your tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = async (tasksToSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
    } catch (error) {
      console.error("Error saving tasks:", error);
      Alert.alert("Error", "Failed to save your tasks");
    }
  };

  const addTask = () => {
    const trimmedTitle = newTaskTitle.trim();
    if (trimmedTitle === "") {
      Alert.alert("Empty Task", "Please enter a task title", [{ text: "OK" }]);
      return;
    }
    const newTask = {
      id: Date.now().toString(),
      title: trimmedTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (taskId, taskTitle) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setTasks(tasks.filter((task) => task.id !== taskId)),
        },
      ],
      { cancelable: true },
    );
  };

  const markAllComplete = () => {
    if (tasks.length === 0) {
      Alert.alert("No Tasks", "There are no tasks to complete");
      return;
    }
    setTasks(tasks.map((task) => ({ ...task, completed: true })));
  };

  const deleteAllCompleted = () => {
    const completedTasks = tasks.filter((task) => task.completed);
    if (completedTasks.length === 0) {
      Alert.alert(
        "No Completed Tasks",
        "There are no completed tasks to delete",
      );
      return;
    }
    Alert.alert(
      "Delete Completed Tasks",
      `Are you sure you want to delete ${completedTasks.length} completed task(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setTasks(tasks.filter((task) => !task.completed)),
        },
      ],
    );
  };

  const clearAllTasks = async () => {
    Alert.alert(
      "Clear All Tasks",
      "Are you sure you want to delete ALL tasks? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setTasks([]);
            await AsyncStorage.removeItem(STORAGE_KEY);
          },
        },
      ],
    );
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const renderTaskItem = ({ item }) => (
    <View className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row items-center flex-1">
        <TouchableOpacity
          onPress={() => toggleTaskCompletion(item.id)}
          className="mr-3"
          activeOpacity={0.7}
        >
          {item.completed ? (
            <CheckCircle size={24} color="#22C55E" />
          ) : (
            <Circle size={24} color="#9CA3AF" />
          )}
        </TouchableOpacity>
        <Text
          className={`flex-1 text-base ${
            item.completed
              ? "line-through text-gray-400 opacity-60"
              : "text-gray-800"
          }`}
        >
          {item.title}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteTask(item.id, item.title)}
        className="p-2"
        activeOpacity={0.7}
      >
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-500">Loading your tasks...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View className="px-5 pt-4 pb-2 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-gray-800">TaskFlow</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Tasks saved on your device
            </Text>
          </View>
          {tasks.length > 0 && (
            <TouchableOpacity onPress={clearAllTasks} activeOpacity={0.7}>
              <Text className="text-red-500 text-sm font-medium">
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Statistics Panel */}
      <View className="flex-row justify-around bg-white mx-5 mt-4 p-4 rounded-xl border border-gray-200">
        <View className="items-center">
          <Text className="text-2xl font-bold text-blue-600">{totalTasks}</Text>
          <Text className="text-xs text-gray-500 mt-1">Total</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-green-600">
            {completedTasks}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">Completed</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-orange-600">
            {pendingTasks}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">Pending</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between px-5 mt-4">
        <TouchableOpacity
          onPress={markAllComplete}
          className="flex-1 mr-2 bg-blue-500 py-3 rounded-xl active:bg-blue-600"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold">
            Complete All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={deleteAllCompleted}
          className="flex-1 ml-2 bg-red-500 py-3 rounded-xl active:bg-red-600"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold">
            Remove Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Task Section */}
      <View className="flex-row px-5 mt-4 mb-2">
        <TextInput
          className="flex-1 bg-white rounded-xl px-4 py-3 mr-2 text-base border border-gray-200"
          placeholder="What needs to be done?"
          placeholderTextColor="#9CA3AF"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity
          onPress={addTask}
          className="bg-purple-600 px-5 rounded-xl justify-center flex-row items-center active:bg-purple-700"
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text className="text-white font-bold text-lg ml-1">Add</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        contentContainerClassName="px-5 py-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Inbox size={80} color="#D1D5DB" />
            <Text className="text-gray-400 text-lg mt-6 font-medium">
              No tasks yet
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center">
              Tap the "Add" button to create{"\n"}your first task
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default App;
