# jsHub Tag Inspector development

require 'rubygems'
require 'sinatra'
gem 'sinatra-static-assets'
require 'sinatra/static_assets'
require 'haml'
require 'zip/zip'
require 'find'


get '/' do
  haml :index
end

get '/build.html' do
  haml :build
end

get '/css.html' do
  haml :css
end

get "/stylesheets/inspector.css" do
  content_type 'text/css'
  sass :"stylesheets/inspector"
end

get '/install' do
  haml :install
end

# Generate an XPI file from a path for Firefox Extension development
# ref: http://www.superwick.com/archives/2007/06/14/generating-zip-file-archives-via-ruby-on-rails/
# ref: http://erratic.inkdeep.com/2006/10/17/joy-of-rubyzip
# ref: http://www.cuberick.com/2007/11/zip-directory-with-ruby.html
get '/inspector-2.0.xpi' do
  src = "#{options.root}/public/xpi"
  output_path = "#{options.root}/tmp/jshubinspector-2.0.xpi"

  # recreate the file for every request (development)
  if File.file?(output_path)
    File.delete(output_path)
  end 
  
  # create the .xpi file
  Zip::ZipFile.open(output_path, Zip::ZipFile::CREATE) do |zipfile|
    Find.find(src) do |path|
      # ignore hidden files and scm folders startin with '.'
      Find.prune if File.basename(path)[0] == ?.
      # remove the filesystem path from the zip file to create a valid XPI file
      dest = /#{src}\/(\w.*)/.match(path)
      zipfile.add(dest[1], path) if dest
    end 
  end  
  
  # set read permissions on the file
  File.chmod(0666, output_path)

  send_file output_path, { :disposition => 'attachment', :type => 'application/zip' }
end