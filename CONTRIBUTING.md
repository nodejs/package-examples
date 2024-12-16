# Contributing guide

## Building the guide locally

```bash
# Clone this repository first, and then switch to the project directory
cd package-examples
cd guide
npm ci
npm run build  # Build the guide book in _book
npm start      # Run a development server that host the built guide
```

The guide book is currently developed using [Honkit](https://github.com/honkit/honkit).
See [the documentation of Honkit](https://honkit.netlify.app/) on how to write a book
and customize the book with it.

We are currently scaffolding the book with the structure in
[`guide/SUMMARY.md`](./guide/SUMMARY.md). Each chapter has their own folder
under [`./guide`](./guide/) and should be numbered, except [Q&A](./guide/q-n-a/)
and [troubleshooting](./guide/troubleshooting/). In some chapters, there are
more subfolders with a `README.md` inside, those are meant to house working
examples. We are also planning to fill those in and create a workflow to run
tests with them.

## Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

 (a) The contribution was created in whole or in part by me and I
     have the right to submit it under the open-source license
     indicated in the file; or

 (b) The contribution is based upon previous work that, to the best
     of my knowledge, is covered under an appropriate open source
     license and I have the right under that license to submit that
     work with modifications, whether created in whole or in part
     by me, under the same open-source license (unless I am
     permitted to submit under a different license), as indicated
     in the file; or

 (c) The contribution was provided directly to me by some other
     person who certified (a), (b), or (c) and I have not modified
     it.

 (d) I understand and agree that this project and the contribution
     are public and that a record of the contribution (including all
     personal information I submit with it, including my sign-off) is
     maintained indefinitely and may be redistributed consistent with
     this project or the open source license(s) involved.


