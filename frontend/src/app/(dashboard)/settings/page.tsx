"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import api from "@/lib/axios"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUploader } from "@/components/ui/image-uploader"

const settingsSchema = z.object({
  // General
  system_name: z.string().min(1, "System Name is required"),
  system_description: z.string().optional().or(z.literal("")),
  copyright: z.string().optional().or(z.literal("")),
  register_enabled: z.boolean(),

  // Images
  logo_url: z.string().optional().or(z.literal("")),
  favicon_url: z.string().optional().or(z.literal("")),

  // Theme
  main_color: z.string().min(1),
  second_color: z.string().min(1),
  bg_gradient_start: z.string().optional().or(z.literal("")),
  bg_gradient_end: z.string().optional().or(z.literal("")),
  style: z.enum(["default", "glassmorphism", "neumorphism"]),

  // Access Control
  teacher_can_see_all_exams: z.boolean(),
  teacher_share_question_bank: z.boolean(),

  // Storage
  cloudinary_cloud_name: z.string().optional().or(z.literal("")),
  cloudinary_api_key: z.string().optional().or(z.literal("")),
  cloudinary_api_secret: z.string().optional().or(z.literal("")),
})

type SettingsValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      system_name: "",
      system_description: "",
      copyright: "",
      register_enabled: true,
      logo_url: "",
      favicon_url: "",
      main_color: "#000000",
      second_color: "#ffffff",
      bg_gradient_start: "",
      bg_gradient_end: "",
      style: "default",
      teacher_can_see_all_exams: true,
      teacher_share_question_bank: true,
      cloudinary_cloud_name: "",
      cloudinary_api_key: "",
      cloudinary_api_secret: "",
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings")
        // Mapping if necessary, but fields match JSON tags
        form.reset(res.data)
      } catch (error) {
        toast.error("Failed to load settings")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [form])

  const onSubmit = async (data: SettingsValues) => {
    try {
      await api.put("/settings", data)
      toast.success("Settings updated successfully")
    } catch (error) {
      toast.error("Failed to update settings")
      console.error(error)
    }
  }

  if (loading) {
    return <div className="p-10">Loading settings...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage general system information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="system_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="system_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="copyright"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Copyright</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="register_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            User Registration
                          </FormLabel>
                          <FormDescription>
                            Allow new users to register.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Access Control & Privacy</CardTitle>
                  <CardDescription>
                    Manage data visibility and sharing scope for teachers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="teacher_can_see_all_exams"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Teachers can see ALL Exams
                          </FormLabel>
                          <FormDescription>
                            If disabled, teachers will ONLY see exams they
                            created.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teacher_share_question_bank"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Global Question Bank (Shared)
                          </FormLabel>
                          <FormDescription>
                            If disabled, teachers will ONLY see questions they
                            created in the subject bank.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Image Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo Image</FormLabel>
                        <FormControl>
                          <ImageUploader
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload the system logo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="favicon_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon Image</FormLabel>
                        <FormControl>
                          <ImageUploader
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Upload the system favicon.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="main_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Color</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 p-1"
                              {...field}
                            />
                            <Input {...field} />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="second_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Second Color</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 p-1"
                              {...field}
                            />
                            <Input {...field} />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bg_gradient_start"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gradient Start</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 p-1"
                              {...field}
                            />
                            <Input {...field} />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bg_gradient_end"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gradient End</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 p-1"
                              {...field}
                            />
                            <Input {...field} />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UI Style</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Default UI</SelectItem>
                            <SelectItem value="glassmorphism">
                              Glassmorphism UI
                            </SelectItem>
                            <SelectItem value="neumorphism">
                              Neumorphism UI
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="storage">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Settings (Cloudinary)</CardTitle>
                  <CardDescription>
                    Configure your Cloudinary credentials for image uploads.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cloudinary_cloud_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cloud Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cloudinary_api_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cloudinary_api_secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Secret</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
